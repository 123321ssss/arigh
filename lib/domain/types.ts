import type { UIMessage } from "ai";

export type AppRole = "admin" | "member";

export type ConversationStatus = "active" | "archived";

export type AgentRunStatus = "ready" | "running" | "completed" | "failed";

export type AuditAction =
  | "auth.login"
  | "auth.logout"
  | "chat.stream"
  | "member.invite"
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

export type Invite = {
  id: string;
  email: string;
  role: AppRole;
  invitedBy: string;
  status: "pending" | "accepted" | "expired";
  createdAt: string;
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
  modelKey: string;
  estimatedCostUsd: number;
  messageCount: number;
  lastPreview: string;
};

export type StoredMessagePayload = {
  role: "user" | "assistant" | "system";
  parts: UIMessage["parts"];
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
