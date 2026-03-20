import type { UIMessage } from "ai";
import { and, asc, desc, eq } from "drizzle-orm";

import { getDb } from "@/lib/data/db";
import {
  agentRuns,
  auditLogs,
  conversations,
  inviteCodes,
  messages,
  modelConfigs,
  profiles,
  promptTemplates,
  toolPolicies,
  usageEvents,
} from "@/lib/data/schema";
import { createDemoState, type DemoState } from "@/lib/domain/seed";
import type {
  AgentRun,
  AuditAction,
  AuditLog,
  BudgetPolicy,
  ConversationSummary,
  InviteCode,
  ModelConfig,
  PromptTemplate,
  SessionUser,
  StoredMessage,
  StoredMessagePayload,
  UsageEvent,
  UsageSummary,
} from "@/lib/domain/types";
import { isDatabaseConfigured } from "@/lib/env";
import { decryptJson, encryptJson } from "@/lib/security/crypto";
import {
  buildInviteCodePreview,
  decryptInviteCode,
  encryptInviteCode,
  generateInviteCode,
  hashInviteCode,
} from "@/lib/security/invite-codes";
import { compactText } from "@/lib/utils";

declare global {
  var __EDITORIAL_AI_DEMO_STATE__: DemoState | undefined;
}

const SHOULD_USE_DATABASE =
  isDatabaseConfigured() && process.env.NODE_ENV !== "test";

let seedPromise: Promise<void> | null = null;

function clone<T>(value: T): T {
  return structuredClone(value);
}

function getState() {
  if (!globalThis.__EDITORIAL_AI_DEMO_STATE__) {
    globalThis.__EDITORIAL_AI_DEMO_STATE__ = createDemoState();
  }

  return globalThis.__EDITORIAL_AI_DEMO_STATE__;
}

function getDatabase() {
  if (!SHOULD_USE_DATABASE) {
    return null;
  }

  return getDb();
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

function parseNumeric(value: string | number | null | undefined) {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    return Number(value);
  }

  return 0;
}

function toIsoString(value: Date | string | null | undefined) {
  if (!value) {
    return null;
  }

  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function buildDisplayNameFromEmail(email: string) {
  return email.split("@")[0] || "new-user";
}

function getRoleFromMetadata(metadata: Record<string, unknown> | null | undefined) {
  const candidate = metadata?.app_role ?? metadata?.role;
  return candidate === "admin" || candidate === "member" ? candidate : null;
}

function getBooleanFromMetadata(
  metadata: Record<string, unknown> | null | undefined,
  key: string,
) {
  const value = metadata?.[key];
  return typeof value === "boolean" ? value : null;
}

function getDisplayNameFromMetadata(
  metadata: Record<string, unknown> | null | undefined,
  email: string,
) {
  const displayName = metadata?.display_name;
  return typeof displayName === "string" && displayName.trim()
    ? displayName.trim()
    : buildDisplayNameFromEmail(email);
}

function getDefaultBudget(role: SessionUser["role"]): BudgetPolicy {
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

function rowToSessionUser(row: typeof profiles.$inferSelect): SessionUser {
  return {
    id: row.id,
    email: row.email,
    displayName: row.displayName,
    avatarUrl: row.avatarUrl ?? undefined,
    role: row.role as SessionUser["role"],
    language: row.language,
    active: row.active,
    budget: {
      monthlyUsdLimit: parseNumeric(row.monthlyBudgetUsd),
      softWarningUsd: parseNumeric(row.softWarningUsd),
    },
    recentLoginAt: row.recentLoginAt.toISOString(),
  };
}

function rowToConversation(row: typeof conversations.$inferSelect): ConversationSummary {
  const lastUsedModelKey = row.lastUsedModelKey ?? row.modelKey;
  const defaultModelKey = row.defaultModelKey ?? row.modelKey;

  return {
    id: row.id,
    title: row.title,
    status: row.status as ConversationSummary["status"],
    updatedAt: row.updatedAt.toISOString(),
    ownerId: row.ownerId,
    defaultModelKey,
    lastUsedModelKey,
    modelKey: lastUsedModelKey,
    estimatedCostUsd: parseNumeric(row.estimatedCostUsd),
    messageCount: row.messageCount,
    lastPreview: row.lastPreview,
  };
}

function rowToModel(row: typeof modelConfigs.$inferSelect): ModelConfig {
  return {
    key: row.key,
    label: row.label,
    providerModelId: row.providerModelId,
    description: row.description,
    enabled: row.enabled,
    defaultSystemPrompt: row.defaultSystemPrompt,
    promptPrefix: row.promptPrefix,
    inputCostPer1k: parseNumeric(row.inputCostPer1k),
    outputCostPer1k: parseNumeric(row.outputCostPer1k),
    monthlyBudgetUsd: parseNumeric(row.monthlyBudgetUsd),
    defaultForMembers: row.defaultForMembers,
  };
}

function rowToPrompt(row: typeof promptTemplates.$inferSelect): PromptTemplate {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    description: row.description,
    content: row.content,
    createdAt: row.createdAt.toISOString(),
  };
}

function rowToInviteCode(
  row: typeof inviteCodes.$inferSelect,
  options?: { includeCode?: boolean },
): InviteCode {
  return {
    id: row.id,
    code: options?.includeCode === false ? undefined : decryptInviteCode(row.encryptedCode),
    codePreview: row.codePreview,
    role: row.role as InviteCode["role"],
    createdBy: row.createdBy,
    status: row.status as InviteCode["status"],
    maxUses: row.maxUses,
    usedCount: row.usedCount,
    allowedEmailDomain: row.allowedEmailDomain ?? undefined,
    note: row.note ?? undefined,
    expiresAt: toIsoString(row.expiresAt) ?? undefined,
    lastUsedAt: toIsoString(row.lastUsedAt) ?? undefined,
    createdAt: row.createdAt.toISOString(),
  };
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

function messageToUiMessage(message: StoredMessage): UIMessage {
  const payload = decryptJson<StoredMessagePayload>(message.encryptedPayload);

  return {
    id: message.id,
    role: payload.role,
    parts: payload.parts,
    metadata: payload.metadata,
  };
}

function toStoredMessages(conversationId: string, uiMessages: UIMessage[]): StoredMessage[] {
  const createdAt = new Date().toISOString();

  return uiMessages.map((message) => {
    const payload: StoredMessagePayload = {
      role: message.role,
      parts: message.parts,
      metadata:
        message.metadata && typeof message.metadata === "object"
          ? (message.metadata as StoredMessagePayload["metadata"])
          : undefined,
    };

    return {
      id: message.id,
      conversationId,
      role: message.role,
      createdAt,
      encryptedPayload: encryptJson(payload),
    };
  });
}

async function ensureBaseDataSeeded() {
  const db = getDatabase();
  if (!db) {
    return;
  }

  if (!seedPromise) {
    seedPromise = (async () => {
      const existingModels = await db.select().from(modelConfigs).limit(1);
      if (existingModels.length > 0) {
        return;
      }

      const seed = createDemoState();
      await db.insert(modelConfigs).values(
        seed.models.map((model) => ({
          key: model.key,
          label: model.label,
          providerModelId: model.providerModelId,
          description: model.description,
          enabled: model.enabled,
          defaultSystemPrompt: model.defaultSystemPrompt,
          promptPrefix: model.promptPrefix,
          inputCostPer1k: String(model.inputCostPer1k),
          outputCostPer1k: String(model.outputCostPer1k),
          monthlyBudgetUsd: String(model.monthlyBudgetUsd),
          defaultForMembers: model.defaultForMembers,
        })),
      );
      await db.insert(promptTemplates).values(
        seed.prompts.map((prompt) => ({
          id: prompt.id,
          name: prompt.name,
          category: prompt.category,
          description: prompt.description,
          content: prompt.content,
          createdAt: new Date(prompt.createdAt),
        })),
      );
      await db.insert(toolPolicies).values({
        id: "default",
        enabledTools: seed.toolPolicy.enabledTools,
        allowedHttpDomains: seed.toolPolicy.allowedHttpDomains,
      });
    })();
  }

  await seedPromise;
}

function getConversationById(state: DemoState, conversationId: string) {
  return state.conversations.find((conversation) => conversation.id === conversationId) ?? null;
}

type InviteCodeDraft = {
  role: InviteCode["role"];
  createdBy: string;
  maxUses?: number;
  expiresAt?: string | null;
  note?: string | null;
  allowedEmailDomain?: string | null;
};

export type SaveConversationSnapshotInput = {
  conversationId: string;
  userId: string;
  modelKey: string;
  messages: UIMessage[];
  estimatedCostUsd?: number;
};

export const appRepository = {
  async getUserById(userId: string) {
    const db = getDatabase();
    if (!db) {
      const state = getState();
      return clone(state.profiles.find((profile) => profile.id === userId) ?? null);
    }

    await ensureBaseDataSeeded();
    const result = await db.select().from(profiles).where(eq(profiles.id, userId)).limit(1);
    return result[0] ? rowToSessionUser(result[0]) : null;
  },

  async getUserByEmail(email: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const db = getDatabase();
    if (!db) {
      const state = getState();
      return clone(
        state.profiles.find(
          (profile) => profile.email.toLowerCase() === normalizedEmail,
        ) ?? null,
      );
    }

    await ensureBaseDataSeeded();
    const result = await db
      .select()
      .from(profiles)
      .where(eq(profiles.email, normalizedEmail))
      .limit(1);
    return result[0] ? rowToSessionUser(result[0]) : null;
  },

  async ensureSupabaseUser(identity: {
    id: string;
    email: string;
    appMetadata?: Record<string, unknown> | null;
    userMetadata?: Record<string, unknown> | null;
    lastSignInAt?: string | null;
  }) {
    const normalizedEmail = identity.email.trim().toLowerCase();
    const now = identity.lastSignInAt ?? new Date().toISOString();
    const roleFromMetadata =
      getRoleFromMetadata(identity.appMetadata) ??
      getRoleFromMetadata(identity.userMetadata);
    const activeFromMetadata =
      getBooleanFromMetadata(identity.appMetadata, "active") ??
      getBooleanFromMetadata(identity.userMetadata, "active");

    const db = getDatabase();
    if (!db) {
      const state = getState();
      const existingIndex = state.profiles.findIndex(
        (profile) => profile.email.toLowerCase() === normalizedEmail,
      );

      if (existingIndex !== -1) {
        state.profiles[existingIndex] = {
          ...state.profiles[existingIndex],
          id: identity.id,
          role: roleFromMetadata ?? state.profiles[existingIndex].role,
          active: activeFromMetadata ?? state.profiles[existingIndex].active,
          displayName: getDisplayNameFromMetadata(identity.userMetadata, normalizedEmail),
          recentLoginAt: now,
        };
        return clone(state.profiles[existingIndex]);
      }

      if (!roleFromMetadata) {
        return null;
      }

      const profile: SessionUser = {
        id: identity.id,
        email: normalizedEmail,
        displayName: getDisplayNameFromMetadata(identity.userMetadata, normalizedEmail),
        role: roleFromMetadata,
        language: "zh-CN",
        active: activeFromMetadata ?? true,
        budget: getDefaultBudget(roleFromMetadata),
        recentLoginAt: now,
      };

      state.profiles.unshift(profile);
      return clone(profile);
    }

    await ensureBaseDataSeeded();
    const existing = await db
      .select()
      .from(profiles)
      .where(eq(profiles.email, normalizedEmail))
      .limit(1);

    if (existing[0]) {
      const current = existing[0];
      const role = roleFromMetadata ?? (current.role as SessionUser["role"]);
      const active = activeFromMetadata ?? current.active;
      const displayName = getDisplayNameFromMetadata(identity.userMetadata, normalizedEmail);

      const [updated] = await db
        .update(profiles)
        .set({
          id: identity.id,
          role,
          active,
          displayName,
          recentLoginAt: new Date(now),
        })
        .where(eq(profiles.email, normalizedEmail))
        .returning();

      return rowToSessionUser(updated);
    }

    if (!roleFromMetadata) {
      return null;
    }

    const budget = getDefaultBudget(roleFromMetadata);
    const [created] = await db
      .insert(profiles)
      .values({
        id: identity.id,
        email: normalizedEmail,
        displayName: getDisplayNameFromMetadata(identity.userMetadata, normalizedEmail),
        role: roleFromMetadata,
        language: "zh-CN",
        avatarUrl: null,
        active: activeFromMetadata ?? true,
        monthlyBudgetUsd: String(budget.monthlyUsdLimit),
        softWarningUsd: String(budget.softWarningUsd),
        recentLoginAt: new Date(now),
        createdAt: new Date(),
      })
      .returning();

    return rowToSessionUser(created);
  },

  async listMembers() {
    const db = getDatabase();
    if (!db) {
      return clone(getState().profiles);
    }

    await ensureBaseDataSeeded();
    const rows = await db.select().from(profiles).orderBy(desc(profiles.recentLoginAt));
    return rows.map(rowToSessionUser);
  },

  async updateMember(memberId: string, updates: Partial<SessionUser>) {
    const db = getDatabase();
    if (!db) {
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
    }

    await ensureBaseDataSeeded();
    const existing = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, memberId))
      .limit(1);
    if (!existing[0]) {
      return null;
    }

    const current = rowToSessionUser(existing[0]);
    const nextBudget = updates.budget ?? current.budget;
    const [updated] = await db
      .update(profiles)
      .set({
        displayName: updates.displayName ?? current.displayName,
        role: updates.role ?? current.role,
        language: updates.language ?? current.language,
        avatarUrl: updates.avatarUrl ?? current.avatarUrl ?? null,
        active: updates.active ?? current.active,
        monthlyBudgetUsd: String(nextBudget.monthlyUsdLimit),
        softWarningUsd: String(nextBudget.softWarningUsd),
        recentLoginAt: new Date(current.recentLoginAt),
      })
      .where(eq(profiles.id, memberId))
      .returning();

    return rowToSessionUser(updated);
  },

  async updateProfile(userId: string, updates: Pick<SessionUser, "displayName" | "language">) {
    return this.updateMember(userId, updates);
  },

  async createInviteCode(input: InviteCodeDraft) {
    const rawCode = generateInviteCode();
    const normalizedMaxUses =
      typeof input.maxUses === "number" && Number.isFinite(input.maxUses)
        ? Math.max(1, input.maxUses)
        : 1;
    const payload: InviteCode = {
      id: crypto.randomUUID(),
      code: rawCode,
      codePreview: buildInviteCodePreview(rawCode),
      role: input.role,
      createdBy: input.createdBy,
      status: "active",
      maxUses: normalizedMaxUses,
      usedCount: 0,
      allowedEmailDomain: input.allowedEmailDomain?.trim() || undefined,
      note: input.note?.trim() || undefined,
      expiresAt: input.expiresAt ?? undefined,
      createdAt: new Date().toISOString(),
    };

    const db = getDatabase();
    if (!db) {
      getState().inviteCodes.unshift(payload);
      return clone(payload);
    }

    await ensureBaseDataSeeded();
    const [created] = await db
      .insert(inviteCodes)
      .values({
        id: payload.id,
        codeHash: hashInviteCode(rawCode),
        encryptedCode: encryptInviteCode(rawCode),
        codePreview: payload.codePreview,
        role: payload.role,
        createdBy: payload.createdBy,
        status: payload.status,
        maxUses: payload.maxUses,
        usedCount: payload.usedCount,
        allowedEmailDomain: payload.allowedEmailDomain ?? null,
        note: payload.note ?? null,
        expiresAt: payload.expiresAt ? new Date(payload.expiresAt) : null,
        lastUsedAt: null,
        createdAt: new Date(payload.createdAt),
      })
      .returning();

    return rowToInviteCode(created);
  },

  async listInviteCodes() {
    const db = getDatabase();
    if (!db) {
      return clone(
        getState().inviteCodes.sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
      );
    }

    await ensureBaseDataSeeded();
    const rows = await db.select().from(inviteCodes).orderBy(desc(inviteCodes.createdAt));
    return rows.map((row) => rowToInviteCode(row));
  },

  async getInviteCodeById(inviteCodeId: string) {
    const db = getDatabase();
    if (!db) {
      return clone(getState().inviteCodes.find((item) => item.id === inviteCodeId) ?? null);
    }

    await ensureBaseDataSeeded();
    const rows = await db
      .select()
      .from(inviteCodes)
      .where(eq(inviteCodes.id, inviteCodeId))
      .limit(1);
    return rows[0] ? rowToInviteCode(rows[0]) : null;
  },

  async revokeInviteCode(inviteCodeId: string) {
    const db = getDatabase();
    if (!db) {
      const state = getState();
      const index = state.inviteCodes.findIndex((item) => item.id === inviteCodeId);
      if (index === -1) {
        return null;
      }
      state.inviteCodes[index] = {
        ...state.inviteCodes[index],
        status: "revoked",
      };
      return clone(state.inviteCodes[index]);
    }

    await ensureBaseDataSeeded();
    const [updated] = await db
      .update(inviteCodes)
      .set({ status: "revoked" })
      .where(eq(inviteCodes.id, inviteCodeId))
      .returning();
    return updated ? rowToInviteCode(updated) : null;
  },

  async validateInviteCode(code: string, email: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedCode = code.trim();
    if (!normalizedCode) {
      return { ok: false as const, error: "邀请码不能为空。" };
    }

    const now = new Date();
    const emailDomain = normalizedEmail.split("@")[1]?.toLowerCase() ?? "";

    const validateCandidate = (inviteCode: InviteCode) => {
      if (inviteCode.status === "revoked") {
        return { ok: false as const, error: "邀请码已失效。" };
      }

      if (inviteCode.expiresAt && new Date(inviteCode.expiresAt) < now) {
        return { ok: false as const, error: "邀请码已过期。" };
      }

      if (inviteCode.usedCount >= inviteCode.maxUses) {
        return { ok: false as const, error: "邀请码已用尽。" };
      }

      if (
        inviteCode.allowedEmailDomain &&
        inviteCode.allowedEmailDomain.toLowerCase() !== emailDomain
      ) {
        return {
          ok: false as const,
          error: `该邀请码只允许 ${inviteCode.allowedEmailDomain} 邮箱注册。`,
        };
      }

      return { ok: true as const, inviteCode };
    };

    const db = getDatabase();
    if (!db) {
      const inviteCode = getState().inviteCodes.find((item) => item.code === normalizedCode);
      if (!inviteCode) {
        return { ok: false as const, error: "邀请码无效。" };
      }

      return validateCandidate(inviteCode);
    }

    await ensureBaseDataSeeded();
    const rows = await db
      .select()
      .from(inviteCodes)
      .where(eq(inviteCodes.codeHash, hashInviteCode(normalizedCode)))
      .limit(1);
    if (!rows[0]) {
      return { ok: false as const, error: "邀请码无效。" };
    }

    return validateCandidate(rowToInviteCode(rows[0]));
  },

  async markInviteCodeUsed(inviteCodeId: string) {
    const db = getDatabase();
    if (!db) {
      const state = getState();
      const index = state.inviteCodes.findIndex((item) => item.id === inviteCodeId);
      if (index === -1) {
        return null;
      }

      const usedCount = state.inviteCodes[index].usedCount + 1;
      state.inviteCodes[index] = {
        ...state.inviteCodes[index],
        usedCount,
        lastUsedAt: new Date().toISOString(),
        status:
          usedCount >= state.inviteCodes[index].maxUses ? "exhausted" : state.inviteCodes[index].status,
      };
      return clone(state.inviteCodes[index]);
    }

    await ensureBaseDataSeeded();
    const current = await db
      .select()
      .from(inviteCodes)
      .where(eq(inviteCodes.id, inviteCodeId))
      .limit(1);
    if (!current[0]) {
      return null;
    }

    const nextUsedCount = current[0].usedCount + 1;
    const [updated] = await db
      .update(inviteCodes)
      .set({
        usedCount: nextUsedCount,
        lastUsedAt: new Date(),
        status: nextUsedCount >= current[0].maxUses ? "exhausted" : current[0].status,
      })
      .where(eq(inviteCodes.id, inviteCodeId))
      .returning();

    return updated ? rowToInviteCode(updated) : null;
  },

  async listModels() {
    const db = getDatabase();
    if (!db) {
      return clone(getState().models);
    }

    await ensureBaseDataSeeded();
    const rows = await db.select().from(modelConfigs).orderBy(asc(modelConfigs.key));
    return rows.map(rowToModel);
  },

  async getModel(key: string) {
    const db = getDatabase();
    if (!db) {
      const model = getState().models.find((item) => item.key === key) ?? null;
      return clone(model);
    }

    await ensureBaseDataSeeded();
    const rows = await db.select().from(modelConfigs).where(eq(modelConfigs.key, key)).limit(1);
    return rows[0] ? rowToModel(rows[0]) : null;
  },

  async getDefaultModel() {
    const db = getDatabase();
    if (!db) {
      const state = getState();
      return clone(state.models.find((model) => model.defaultForMembers) ?? state.models[0]);
    }

    await ensureBaseDataSeeded();
    const rows = await db
      .select()
      .from(modelConfigs)
      .where(eq(modelConfigs.defaultForMembers, true))
      .limit(1);
    if (rows[0]) {
      return rowToModel(rows[0]);
    }

    const fallback = await db.select().from(modelConfigs).limit(1);
    return rowToModel(fallback[0]);
  },

  async updateModel(key: string, updates: Partial<ModelConfig>) {
    const db = getDatabase();
    if (!db) {
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
    }

    await ensureBaseDataSeeded();
    const current = await this.getModel(key);
    if (!current) {
      return null;
    }

    const [updated] = await db
      .update(modelConfigs)
      .set({
        label: updates.label ?? current.label,
        providerModelId: updates.providerModelId ?? current.providerModelId,
        description: updates.description ?? current.description,
        enabled: updates.enabled ?? current.enabled,
        defaultSystemPrompt: updates.defaultSystemPrompt ?? current.defaultSystemPrompt,
        promptPrefix: updates.promptPrefix ?? current.promptPrefix,
        inputCostPer1k: String(updates.inputCostPer1k ?? current.inputCostPer1k),
        outputCostPer1k: String(updates.outputCostPer1k ?? current.outputCostPer1k),
        monthlyBudgetUsd: String(updates.monthlyBudgetUsd ?? current.monthlyBudgetUsd),
        defaultForMembers: updates.defaultForMembers ?? current.defaultForMembers,
      })
      .where(eq(modelConfigs.key, key))
      .returning();

    return updated ? rowToModel(updated) : null;
  },

  async listPromptTemplates() {
    const db = getDatabase();
    if (!db) {
      return clone(getState().prompts);
    }

    await ensureBaseDataSeeded();
    const rows = await db.select().from(promptTemplates).orderBy(desc(promptTemplates.createdAt));
    return rows.map(rowToPrompt);
  },

  async getPromptTemplate(promptTemplateId: string | null | undefined) {
    if (!promptTemplateId) {
      return null;
    }

    const db = getDatabase();
    if (!db) {
      const prompt = getState().prompts.find((item) => item.id === promptTemplateId) ?? null;
      return clone(prompt);
    }

    await ensureBaseDataSeeded();
    const rows = await db
      .select()
      .from(promptTemplates)
      .where(eq(promptTemplates.id, promptTemplateId))
      .limit(1);
    return rows[0] ? rowToPrompt(rows[0]) : null;
  },

  async createPrompt(input: Omit<PromptTemplate, "id" | "createdAt">) {
    const prompt: PromptTemplate = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...input,
    };

    const db = getDatabase();
    if (!db) {
      getState().prompts.unshift(prompt);
      return clone(prompt);
    }

    await ensureBaseDataSeeded();
    const [created] = await db
      .insert(promptTemplates)
      .values({
        id: prompt.id,
        name: prompt.name,
        category: prompt.category,
        description: prompt.description,
        content: prompt.content,
        createdAt: new Date(prompt.createdAt),
      })
      .returning();

    return rowToPrompt(created);
  },

  async getToolPolicy() {
    const db = getDatabase();
    if (!db) {
      return clone(getState().toolPolicy);
    }

    await ensureBaseDataSeeded();
    const rows = await db.select().from(toolPolicies).limit(1);
    return rows[0]
      ? {
          enabledTools: rows[0].enabledTools,
          allowedHttpDomains: rows[0].allowedHttpDomains,
        }
      : { enabledTools: [], allowedHttpDomains: [] };
  },

  async listConversationsForUser(userId: string) {
    const db = getDatabase();
    if (!db) {
      const state = getState();
      return clone(
        state.conversations
          .filter((conversation) => conversation.ownerId === userId)
          .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
      );
    }

    await ensureBaseDataSeeded();
    const rows = await db
      .select()
      .from(conversations)
      .where(eq(conversations.ownerId, userId))
      .orderBy(desc(conversations.updatedAt));
    return rows.map(rowToConversation);
  },

  async listAllConversations() {
    const db = getDatabase();
    if (!db) {
      return clone(
        getState().conversations.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
      );
    }

    await ensureBaseDataSeeded();
    const rows = await db.select().from(conversations).orderBy(desc(conversations.updatedAt));
    return rows.map(rowToConversation);
  },

  async getConversationForUser(conversationId: string, userId: string) {
    const db = getDatabase();
    if (!db) {
      const conversation = getConversationById(getState(), conversationId);
      if (!conversation || conversation.ownerId !== userId) {
        return null;
      }

      return clone(conversation);
    }

    await ensureBaseDataSeeded();
    const rows = await db
      .select()
      .from(conversations)
      .where(
        and(eq(conversations.id, conversationId), eq(conversations.ownerId, userId)),
      )
      .limit(1);
    return rows[0] ? rowToConversation(rows[0]) : null;
  },

  async createConversation(userId: string, modelKey: string) {
    const now = new Date().toISOString();
    const conversation: ConversationSummary = {
      id: crypto.randomUUID(),
      ownerId: userId,
      title: "未命名会话",
      status: "active",
      defaultModelKey: modelKey,
      lastUsedModelKey: modelKey,
      modelKey,
      estimatedCostUsd: 0,
      messageCount: 0,
      lastPreview: "从这里开始一次新的内部对话。",
      updatedAt: now,
    };

    const db = getDatabase();
    if (!db) {
      getState().conversations.unshift(conversation);
      return clone(conversation);
    }

    await ensureBaseDataSeeded();
    const [created] = await db
      .insert(conversations)
      .values({
        id: conversation.id,
        ownerId: conversation.ownerId,
        title: conversation.title,
        status: conversation.status,
        modelKey: conversation.modelKey,
        defaultModelKey: conversation.defaultModelKey,
        lastUsedModelKey: conversation.lastUsedModelKey,
        estimatedCostUsd: String(conversation.estimatedCostUsd),
        messageCount: conversation.messageCount,
        lastPreview: conversation.lastPreview,
        updatedAt: new Date(now),
        createdAt: new Date(now),
      })
      .returning();

    return rowToConversation(created);
  },

  async updateConversation(
    conversationId: string,
    userId: string,
    updates: Partial<ConversationSummary>,
  ) {
    const db = getDatabase();
    if (!db) {
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
    }

    await ensureBaseDataSeeded();
    const current = await this.getConversationForUser(conversationId, userId);
    if (!current) {
      return null;
    }

    const [updated] = await db
      .update(conversations)
      .set({
        title: updates.title ?? current.title,
        status: updates.status ?? current.status,
        modelKey: updates.modelKey ?? current.modelKey,
        defaultModelKey: updates.defaultModelKey ?? current.defaultModelKey,
        lastUsedModelKey: updates.lastUsedModelKey ?? current.lastUsedModelKey,
        estimatedCostUsd: String(updates.estimatedCostUsd ?? current.estimatedCostUsd),
        messageCount: updates.messageCount ?? current.messageCount,
        lastPreview: updates.lastPreview ?? current.lastPreview,
        updatedAt: new Date(),
      })
      .where(
        and(eq(conversations.id, conversationId), eq(conversations.ownerId, userId)),
      )
      .returning();

    return updated ? rowToConversation(updated) : null;
  },

  async deleteConversation(conversationId: string, userId: string) {
    const db = getDatabase();
    if (!db) {
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
      state.messages = state.messages.filter(
        (message) => message.conversationId !== conversationId,
      );
      state.agentRuns = state.agentRuns.filter((run) => run.conversationId !== conversationId);

      return true;
    }

    await ensureBaseDataSeeded();
    const current = await this.getConversationForUser(conversationId, userId);
    if (!current) {
      return false;
    }

    await db.delete(messages).where(eq(messages.conversationId, conversationId));
    await db.delete(agentRuns).where(eq(agentRuns.conversationId, conversationId));
    await db
      .delete(conversations)
      .where(and(eq(conversations.id, conversationId), eq(conversations.ownerId, userId)));
    return true;
  },

  async listMessagesForConversation(conversationId: string, userId: string) {
    const conversation = await this.getConversationForUser(conversationId, userId);
    if (!conversation) {
      return [];
    }

    const db = getDatabase();
    if (!db) {
      return clone(
        getState()
          .messages.filter((message) => message.conversationId === conversationId)
          .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
          .map(messageToUiMessage),
      );
    }

    await ensureBaseDataSeeded();
    const rows = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(asc(messages.createdAt));

    return rows.map((row) => {
      const payload = decryptJson<StoredMessagePayload>(row.encryptedPayload);
      return {
        id: row.id,
        role: payload.role,
        parts: payload.parts,
        metadata: payload.metadata ?? row.payloadMeta,
      } satisfies UIMessage;
    });
  },

  async saveConversationSnapshot({
    conversationId,
    userId,
    modelKey,
    messages: uiMessages,
    estimatedCostUsd,
  }: SaveConversationSnapshotInput) {
    const conversation = await this.getConversationForUser(conversationId, userId);

    if (!conversation) {
      return null;
    }

    const firstUserMessage = uiMessages.find((message) => message.role === "user");
    const lastMessage = uiMessages[uiMessages.length - 1];
    const titleCandidate = firstUserMessage
      ? compactText(extractText(firstUserMessage.parts), 28)
      : conversation.title;
    const nextTitle =
      conversation.title === "未命名会话" && titleCandidate ? titleCandidate : conversation.title;

    const db = getDatabase();
    if (!db) {
      const state = getState();
      state.messages = state.messages.filter((message) => message.conversationId !== conversationId);
      state.messages.push(...toStoredMessages(conversationId, uiMessages));

      const summary = state.conversations.find((item) => item.id === conversationId);
      if (!summary) {
        return null;
      }

      summary.modelKey = modelKey;
      summary.lastUsedModelKey = modelKey;
      summary.messageCount = uiMessages.length;
      summary.lastPreview = compactText(extractText(lastMessage?.parts ?? []), 60);
      summary.updatedAt = new Date().toISOString();
      summary.estimatedCostUsd = estimatedCostUsd ?? summary.estimatedCostUsd;
      summary.title = nextTitle;

      return clone(summary);
    }

    await ensureBaseDataSeeded();
    const storedMessages = toStoredMessages(conversationId, uiMessages);
    await db.delete(messages).where(eq(messages.conversationId, conversationId));
    if (storedMessages.length > 0) {
      await db.insert(messages).values(
        storedMessages.map((message) => {
          const payload = decryptJson<StoredMessagePayload>(message.encryptedPayload);
          return {
            id: message.id,
            conversationId: message.conversationId,
            role: message.role,
            encryptedPayload: message.encryptedPayload,
            payloadMeta: payload.metadata ?? {},
            createdAt: new Date(message.createdAt),
          };
        }),
      );
    }

    const [updated] = await db
      .update(conversations)
      .set({
        title: nextTitle,
        modelKey,
        lastUsedModelKey: modelKey,
        messageCount: uiMessages.length,
        lastPreview: compactText(extractText(lastMessage?.parts ?? []), 60),
        estimatedCostUsd: String(estimatedCostUsd ?? conversation.estimatedCostUsd),
        updatedAt: new Date(),
      })
      .where(
        and(eq(conversations.id, conversationId), eq(conversations.ownerId, userId)),
      )
      .returning();

    return updated ? rowToConversation(updated) : null;
  },

  async listAgentRuns(conversationId: string, userId: string) {
    const conversation = await this.getConversationForUser(conversationId, userId);
    if (!conversation) {
      return [];
    }

    const db = getDatabase();
    if (!db) {
      return clone(
        getState()
          .agentRuns.filter((run) => run.conversationId === conversationId)
          .sort((a, b) => b.startedAt.localeCompare(a.startedAt)),
      );
    }

    await ensureBaseDataSeeded();
    const rows = await db
      .select()
      .from(agentRuns)
      .where(eq(agentRuns.conversationId, conversationId))
      .orderBy(desc(agentRuns.startedAt));

    return rows.map((row) => ({
      id: row.id,
      conversationId: row.conversationId,
      status: row.status as AgentRun["status"],
      modelKey: row.modelKey,
      traceId: row.traceId,
      startedAt: row.startedAt.toISOString(),
      finishedAt: toIsoString(row.finishedAt) ?? undefined,
      steps: decryptJson<AgentRun["steps"]>(row.encryptedPayload),
    }));
  },

  async saveAgentRun(run: AgentRun) {
    const db = getDatabase();
    if (!db) {
      const state = getState();
      const index = state.agentRuns.findIndex((item) => item.id === run.id);

      if (index === -1) {
        state.agentRuns.unshift(run);
      } else {
        state.agentRuns[index] = run;
      }

      return clone(run);
    }

    await ensureBaseDataSeeded();
    const existing = await db.select().from(agentRuns).where(eq(agentRuns.id, run.id)).limit(1);
    const values = {
      id: run.id,
      conversationId: run.conversationId,
      modelKey: run.modelKey,
      status: run.status,
      traceId: run.traceId,
      encryptedPayload: encryptJson(run.steps),
      startedAt: new Date(run.startedAt),
      finishedAt: run.finishedAt ? new Date(run.finishedAt) : null,
    };

    if (existing[0]) {
      await db.update(agentRuns).set(values).where(eq(agentRuns.id, run.id));
    } else {
      await db.insert(agentRuns).values(values);
    }

    return clone(run);
  },

  async createUsageEvent(event: UsageEvent) {
    const db = getDatabase();
    if (!db) {
      getState().usageEvents.unshift(event);
      return clone(event);
    }

    await ensureBaseDataSeeded();
    await db.insert(usageEvents).values({
      id: event.id,
      userId: event.userId,
      conversationId: event.conversationId,
      modelKey: event.modelKey,
      inputTokens: event.inputTokens,
      outputTokens: event.outputTokens,
      estimatedCostUsd: String(event.estimatedCostUsd),
      providerResponseId: event.providerResponseId,
      latencyMs: event.latencyMs,
      createdAt: new Date(event.createdAt),
    });

    return clone(event);
  },

  async listUsageEvents(userId?: string) {
    const db = getDatabase();
    if (!db) {
      return clone(
        getState().usageEvents.filter((event) => (userId ? event.userId === userId : true)),
      );
    }

    await ensureBaseDataSeeded();
    const rows = userId
      ? await db.select().from(usageEvents).where(eq(usageEvents.userId, userId))
      : await db.select().from(usageEvents);

    return rows.map((row) => ({
      id: row.id,
      userId: row.userId,
      conversationId: row.conversationId,
      modelKey: row.modelKey,
      inputTokens: row.inputTokens,
      outputTokens: row.outputTokens,
      estimatedCostUsd: parseNumeric(row.estimatedCostUsd),
      providerResponseId: row.providerResponseId,
      latencyMs: row.latencyMs,
      createdAt: row.createdAt.toISOString(),
    }));
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

    const db = getDatabase();
    if (!db) {
      getState().auditLogs.unshift(log);
      return clone(log);
    }

    await ensureBaseDataSeeded();
    await db.insert(auditLogs).values({
      id: log.id,
      actorId: log.actorId,
      action: log.action,
      detail: log.detail,
      createdAt: new Date(log.createdAt),
    });
    return log;
  },

  async listAuditLogs() {
    const db = getDatabase();
    if (!db) {
      return clone(getState().auditLogs.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
    }

    await ensureBaseDataSeeded();
    const rows = await db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt));
    return rows.map((row) => ({
      id: row.id,
      actorId: row.actorId,
      action: row.action as AuditAction,
      detail: row.detail,
      createdAt: row.createdAt.toISOString(),
    }));
  },
};

export type AppRepository = typeof appRepository;
