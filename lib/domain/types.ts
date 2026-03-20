import type { UIMessage } from "ai";

export type AppRole = "admin" | "member";

export type ConversationStatus = "active" | "archived";

export type AgentRunStatus = "ready" | "running" | "completed" | "failed";

export type InviteCodeStatus = "active" | "revoked" | "expired" | "exhausted";

export type AuditAction =
  | "auth.login"
  | "auth.register"
  | "auth.bootstrap"
  | "auth.logout"
  | "chat.stream"
  | "invite-code.create"
  | "invite-code.revoke"
  | "member.update"
  | "model.update"
  | "prompt.create";

export type ToolPolicy = {
  enabledTools: string[];
  allowedHttpDomains: string[];
};

export type BudgetPolicy = {
  monthlyUsdLimit: number;
  softWarningUsd: number;
};

export type SessionUser = {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  role: AppRole;
  language: string;
  active: boolean;
  budget: BudgetPolicy;
  recentLoginAt: string;
};

export type AuthCredentialProfile = {
  email: string;
  password: string;
  displayName: string;
};

export type InviteCode = {
  id: string;
  code?: string;
  codePreview: string;
  role: AppRole;
  createdBy: string;
  status: InviteCodeStatus;
  maxUses: number;
  usedCount: number;
  allowedEmailDomain?: string | null;
  note?: string | null;
  expiresAt?: string | null;
  lastUsedAt?: string | null;
  createdAt: string;
};

export type RegisterWithInviteInput = AuthCredentialProfile & {
  code: string;
};

export type ModelConfig = {
  key: string;
  label: string;
  providerModelId: string;
  description: string;
  enabled: boolean;
  defaultSystemPrompt: string;
  promptPrefix: string;
  inputCostPer1k: number;
  outputCostPer1k: number;
  monthlyBudgetUsd: number;
  defaultForMembers: boolean;
};

export type PromptTemplate = {
  id: string;
  name: string;
  category: string;
  description: string;
  content: string;
  createdAt: string;
};

export type ConversationSummary = {
  id: string;
  title: string;
  status: ConversationStatus;
  updatedAt: string;
  ownerId: string;
  defaultModelKey: string;
  lastUsedModelKey: string;
  modelKey: string;
  estimatedCostUsd: number;
  messageCount: number;
  lastPreview: string;
};

export type MessageMeta = {
  modelKey?: string;
  modelLabel?: string;
  promptTemplateId?: string | null;
};

export type StoredMessagePayload = {
  role: "user" | "assistant" | "system";
  parts: UIMessage["parts"];
  metadata?: MessageMeta;
};

export type StoredMessage = {
  id: string;
  conversationId: string;
  role: "user" | "assistant" | "system";
  createdAt: string;
  encryptedPayload: string;
};

export type AgentStep = {
  id: string;
  label: string;
  status: "queued" | "running" | "completed" | "failed";
  startedAt: string;
  finishedAt?: string;
  detail: string;
};

export type AgentRun = {
  id: string;
  conversationId: string;
  status: AgentRunStatus;
  modelKey: string;
  traceId: string;
  startedAt: string;
  finishedAt?: string;
  steps: AgentStep[];
};

export type UsageEvent = {
  id: string;
  userId: string;
  conversationId: string;
  modelKey: string;
  inputTokens: number;
  outputTokens: number;
  estimatedCostUsd: number;
  providerResponseId: string;
  latencyMs: number;
  createdAt: string;
};

export type AuditLog = {
  id: string;
  actorId: string;
  action: AuditAction;
  detail: string;
  createdAt: string;
};

export type UsageSummary = {
  totalCostUsd: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalRequests: number;
  daily: Array<{
    date: string;
    costUsd: number;
    requests: number;
  }>;
  byModel: Array<{
    modelKey: string;
    costUsd: number;
    requests: number;
  }>;
};

export type DashboardMetric = {
  label: string;
  value: string;
  hint: string;
};
