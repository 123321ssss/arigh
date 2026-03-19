import type { UIMessage } from "ai";

import { createDemoState, type DemoState } from "@/lib/domain/seed";
import type {
  AgentRun,
  AuditAction,
  AuditLog,
  ConversationSummary,
  Invite,
  ModelConfig,
  PromptTemplate,
  SessionUser,
  StoredMessage,
  StoredMessagePayload,
  UsageEvent,
  UsageSummary,
} from "@/lib/domain/types";
import { compactText } from "@/lib/utils";
import { decryptJson, encryptJson } from "@/lib/security/crypto";

declare global {
  var __EDITORIAL_AI_DEMO_STATE__: DemoState | undefined;
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

function getState() {
  if (!globalThis.__EDITORIAL_AI_DEMO_STATE__) {
    globalThis.__EDITORIAL_AI_DEMO_STATE__ = createDemoState();
  }

  return globalThis.__EDITORIAL_AI_DEMO_STATE__;
}

function extractText(parts: UIMessage["parts"]) {
  return parts
    .map((part) => {
      if (part.type === "text") {
        return part.text;
      }

      return "";
    })
    .filter(Boolean)
    .join("\n");
}

function messageToUiMessage(message: StoredMessage): UIMessage {
  const payload = decryptJson<StoredMessagePayload>(message.encryptedPayload);

  return {
    id: message.id,
    role: payload.role,
    parts: payload.parts,
  };
}

function toStoredMessages(conversationId: string, messages: UIMessage[]): StoredMessage[] {
  return messages.map((message) => {
    const payload: StoredMessagePayload = {
      role: message.role,
      parts: message.parts,
    };

    return {
      id: message.id,
      conversationId,
      role: message.role,
      createdAt: new Date().toISOString(),
      encryptedPayload: encryptJson(payload),
    };
  });
}

function buildUsageSummary(events: UsageEvent[]): UsageSummary {
  const totalCostUsd = events.reduce((sum, event) => sum + event.estimatedCostUsd, 0);
  const totalInputTokens = events.reduce((sum, event) => sum + event.inputTokens, 0);
  const totalOutputTokens = events.reduce((sum, event) => sum + event.outputTokens, 0);
  const totalRequests = events.length;

  const dailyMap = new Map<string, { date: string; costUsd: number; requests: number }>();
  const modelMap = new Map<string, { modelKey: string; costUsd: number; requests: number }>();

  for (const event of events) {
    const date = event.createdAt.slice(0, 10);
    const daily = dailyMap.get(date) ?? { date, costUsd: 0, requests: 0 };
    daily.costUsd += event.estimatedCostUsd;
    daily.requests += 1;
    dailyMap.set(date, daily);

    const model = modelMap.get(event.modelKey) ?? {
      modelKey: event.modelKey,
      costUsd: 0,
      requests: 0,
    };
    model.costUsd += event.estimatedCostUsd;
    model.requests += 1;
    modelMap.set(event.modelKey, model);
  }

  return {
    totalCostUsd,
    totalInputTokens,
    totalOutputTokens,
    totalRequests,
    daily: Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date)),
    byModel: Array.from(modelMap.values()).sort((a, b) => b.costUsd - a.costUsd),
  };
}

function getConversationById(state: DemoState, conversationId: string) {
  return state.conversations.find((conversation) => conversation.id === conversationId) ?? null;
}

function getDefaultBudget(role: SessionUser["role"]) {
  if (role === "admin") {
    return {
      monthlyUsdLimit: 80,
      softWarningUsd: 60,
    };
  }

  return {
    monthlyUsdLimit: 30,
    softWarningUsd: 20,
  };
}

function buildDisplayNameFromEmail(email: string) {
  return email.split("@")[0] || "new-user";
}

function isBootstrapEligible(state: DemoState) {
  return !state.profiles.some((profile) => !profile.email.endsWith("@editorial.local"));
}

export type SaveConversationSnapshotInput = {
  conversationId: string;
  userId: string;
  modelKey: string;
  messages: UIMessage[];
  estimatedCostUsd?: number;
};

export const appRepository = {
  async getUserById(userId: string) {
    const state = getState();
    return clone(state.profiles.find((profile) => profile.id === userId) ?? null);
  },

  async getUserByEmail(email: string) {
    const state = getState();
    return clone(
      state.profiles.find(
        (profile) => profile.email.toLowerCase() === email.toLowerCase(),
      ) ?? null,
    );
  },

  async ensureSupabaseUser(email: string) {
    const state = getState();
    const normalizedEmail = email.trim().toLowerCase();
    const now = new Date().toISOString();
    const existingIndex = state.profiles.findIndex(
      (profile) => profile.email.toLowerCase() === normalizedEmail,
    );

    if (existingIndex !== -1) {
      state.profiles[existingIndex] = {
        ...state.profiles[existingIndex],
        recentLoginAt: now,
      };
      return clone(state.profiles[existingIndex]);
    }

    const inviteIndex = state.invites.findIndex(
      (invite) =>
        invite.email.toLowerCase() === normalizedEmail &&
        (invite.status === "pending" || invite.status === "accepted"),
    );

    let role: SessionUser["role"] | null = null;
    if (inviteIndex !== -1) {
      role = state.invites[inviteIndex].role;
      state.invites[inviteIndex] = {
        ...state.invites[inviteIndex],
        status: "accepted",
      };
    } else if (isBootstrapEligible(state)) {
      role = "admin";
    }

    if (!role) {
      return null;
    }

    const profile: SessionUser = {
      id: crypto.randomUUID(),
      email: normalizedEmail,
      displayName: buildDisplayNameFromEmail(normalizedEmail),
      role,
      language: "zh-CN",
      active: true,
      budget: getDefaultBudget(role),
      recentLoginAt: now,
    };

    state.profiles.unshift(profile);
    return clone(profile);
  },

  async listMembers() {
    const state = getState();
    return clone(state.profiles);
  },

  async updateMember(memberId: string, updates: Partial<SessionUser>) {
    const state = getState();
    const index = state.profiles.findIndex((profile) => profile.id === memberId);

    if (index === -1) {
      return null;
    }

    state.profiles[index] = {
      ...state.profiles[index],
      ...updates,
      budget: updates.budget ?? state.profiles[index].budget,
    };

    return clone(state.profiles[index]);
  },

  async updateProfile(userId: string, updates: Pick<SessionUser, "displayName" | "language">) {
    return this.updateMember(userId, updates);
  },

  async createInvite(email: string, role: Invite["role"], invitedBy: string) {
    const state = getState();
    const invite: Invite = {
      id: crypto.randomUUID(),
      email,
      role,
      invitedBy,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    state.invites.unshift(invite);

    return clone(invite);
  },

  async listInvites() {
    return clone(getState().invites);
  },

  async listModels() {
    return clone(getState().models);
  },

  async getModel(key: string) {
    const model = getState().models.find((item) => item.key === key) ?? null;
    return clone(model);
  },

  async getDefaultModel() {
    const state = getState();
    return clone(state.models.find((model) => model.defaultForMembers) ?? state.models[0]);
  },

  async updateModel(key: string, updates: Partial<ModelConfig>) {
    const state = getState();
    const index = state.models.findIndex((model) => model.key === key);

    if (index === -1) {
      return null;
    }

    state.models[index] = {
      ...state.models[index],
      ...updates,
    };

    return clone(state.models[index]);
  },

  async listPromptTemplates() {
    return clone(getState().prompts);
  },

  async getPromptTemplate(promptTemplateId: string | null | undefined) {
    if (!promptTemplateId) {
      return null;
    }

    const prompt =
      getState().prompts.find((item) => item.id === promptTemplateId) ?? null;
    return clone(prompt);
  },

  async createPrompt(input: Omit<PromptTemplate, "id" | "createdAt">) {
    const state = getState();
    const prompt: PromptTemplate = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...input,
    };
    state.prompts.unshift(prompt);

    return clone(prompt);
  },

  async getToolPolicy() {
    return clone(getState().toolPolicy);
  },

  async listConversationsForUser(userId: string) {
    const state = getState();
    return clone(
      state.conversations
        .filter((conversation) => conversation.ownerId === userId)
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    );
  },

  async listAllConversations() {
    return clone(
      getState().conversations.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    );
  },

  async getConversationForUser(conversationId: string, userId: string) {
    const conversation = getConversationById(getState(), conversationId);
    if (!conversation || conversation.ownerId !== userId) {
      return null;
    }

    return clone(conversation);
  },

  async createConversation(userId: string, modelKey: string) {
    const state = getState();
    const conversation: ConversationSummary = {
      id: crypto.randomUUID(),
      ownerId: userId,
      title: "未命名会话",
      status: "active",
      modelKey,
      estimatedCostUsd: 0,
      messageCount: 0,
      lastPreview: "从这里开始一次新的内部对话。",
      updatedAt: new Date().toISOString(),
    };

    state.conversations.unshift(conversation);
    return clone(conversation);
  },

  async updateConversation(
    conversationId: string,
    userId: string,
    updates: Partial<ConversationSummary>,
  ) {
    const state = getState();
    const index = state.conversations.findIndex(
      (conversation) =>
        conversation.id === conversationId && conversation.ownerId === userId,
    );

    if (index === -1) {
      return null;
    }

    state.conversations[index] = {
      ...state.conversations[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    return clone(state.conversations[index]);
  },

  async deleteConversation(conversationId: string, userId: string) {
    const state = getState();
    const existing = state.conversations.find(
      (conversation) => conversation.id === conversationId && conversation.ownerId === userId,
    );

    if (!existing) {
      return false;
    }

    state.conversations = state.conversations.filter(
      (conversation) => conversation.id !== conversationId,
    );
    state.messages = state.messages.filter((message) => message.conversationId !== conversationId);
    state.agentRuns = state.agentRuns.filter((run) => run.conversationId !== conversationId);

    return true;
  },

  async listMessagesForConversation(conversationId: string, userId: string) {
    const conversation = await this.getConversationForUser(conversationId, userId);
    if (!conversation) {
      return [];
    }

    return clone(
      getState()
        .messages.filter((message) => message.conversationId === conversationId)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
        .map(messageToUiMessage),
    );
  },

  async saveConversationSnapshot({
    conversationId,
    userId,
    modelKey,
    messages,
    estimatedCostUsd,
  }: SaveConversationSnapshotInput) {
    const state = getState();
    const conversation = await this.getConversationForUser(conversationId, userId);

    if (!conversation) {
      return null;
    }

    state.messages = state.messages.filter((message) => message.conversationId !== conversationId);
    state.messages.push(...toStoredMessages(conversationId, messages));

    const firstUserMessage = messages.find((message) => message.role === "user");
    const lastMessage = messages[messages.length - 1];
    const titleCandidate = firstUserMessage
      ? compactText(extractText(firstUserMessage.parts), 28)
      : conversation.title;

    const summary = state.conversations.find((item) => item.id === conversationId);
    if (!summary) {
      return null;
    }

    summary.modelKey = modelKey;
    summary.messageCount = messages.length;
    summary.lastPreview = compactText(extractText(lastMessage?.parts ?? []), 60);
    summary.updatedAt = new Date().toISOString();
    summary.estimatedCostUsd = estimatedCostUsd ?? summary.estimatedCostUsd;
    summary.title =
      summary.title === "未命名会话" && titleCandidate ? titleCandidate : summary.title;

    return clone(summary);
  },

  async listAgentRuns(conversationId: string, userId: string) {
    const conversation = await this.getConversationForUser(conversationId, userId);
    if (!conversation) {
      return [];
    }

    return clone(
      getState()
        .agentRuns.filter((run) => run.conversationId === conversationId)
        .sort((a, b) => b.startedAt.localeCompare(a.startedAt)),
    );
  },

  async saveAgentRun(run: AgentRun) {
    const state = getState();
    const index = state.agentRuns.findIndex((item) => item.id === run.id);

    if (index === -1) {
      state.agentRuns.unshift(run);
    } else {
      state.agentRuns[index] = run;
    }

    return clone(run);
  },

  async createUsageEvent(event: UsageEvent) {
    getState().usageEvents.unshift(event);
    return clone(event);
  },

  async listUsageEvents(userId?: string) {
    return clone(
      getState().usageEvents.filter((event) => (userId ? event.userId === userId : true)),
    );
  },

  async getUsageSummary(userId?: string) {
    const events = await this.listUsageEvents(userId);
    return buildUsageSummary(events);
  },

  async addAuditLog(actorId: string, action: AuditAction, detail: string) {
    const log: AuditLog = {
      id: crypto.randomUUID(),
      actorId,
      action,
      detail,
      createdAt: new Date().toISOString(),
    };
    getState().auditLogs.unshift(log);
    return clone(log);
  },

  async listAuditLogs() {
    return clone(getState().auditLogs.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  },
};

export type AppRepository = typeof appRepository;
