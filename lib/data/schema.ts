import {
  boolean,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const profiles = pgTable("profiles", {
  id: varchar("id", { length: 64 }).primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  displayName: varchar("display_name", { length: 120 }).notNull(),
  role: varchar("role", { length: 16 }).notNull(),
  language: varchar("language", { length: 16 }).notNull().default("zh-CN"),
  avatarUrl: text("avatar_url"),
  active: boolean("active").notNull().default(true),
  monthlyBudgetUsd: numeric("monthly_budget_usd", {
    precision: 10,
    scale: 2,
  }).notNull(),
  softWarningUsd: numeric("soft_warning_usd", {
    precision: 10,
    scale: 2,
  }).notNull(),
  recentLoginAt: timestamp("recent_login_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
});

export const invites = pgTable("invites", {
  id: varchar("id", { length: 64 }).primaryKey(),
  email: varchar("email", { length: 320 }).notNull(),
  role: varchar("role", { length: 16 }).notNull(),
  invitedBy: varchar("invited_by", { length: 64 }).notNull(),
  status: varchar("status", { length: 16 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
});

export const conversations = pgTable("conversations", {
  id: varchar("id", { length: 64 }).primaryKey(),
  ownerId: varchar("owner_id", { length: 64 }).notNull(),
  title: varchar("title", { length: 160 }).notNull(),
  status: varchar("status", { length: 16 }).notNull(),
  modelKey: varchar("model_key", { length: 64 }).notNull(),
  estimatedCostUsd: numeric("estimated_cost_usd", {
    precision: 10,
    scale: 4,
  }).notNull(),
  messageCount: integer("message_count").notNull(),
  lastPreview: text("last_preview").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
});

export const messages = pgTable("messages", {
  id: varchar("id", { length: 64 }).primaryKey(),
  conversationId: varchar("conversation_id", { length: 64 }).notNull(),
  role: varchar("role", { length: 16 }).notNull(),
  encryptedPayload: text("encrypted_payload").notNull(),
  payloadMeta: jsonb("payload_meta").$type<Record<string, unknown>>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
});

export const agentRuns = pgTable("agent_runs", {
  id: varchar("id", { length: 64 }).primaryKey(),
  conversationId: varchar("conversation_id", { length: 64 }).notNull(),
  modelKey: varchar("model_key", { length: 64 }).notNull(),
  status: varchar("status", { length: 16 }).notNull(),
  traceId: varchar("trace_id", { length: 64 }).notNull(),
  encryptedPayload: text("encrypted_payload").notNull(),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
});

export const modelConfigs = pgTable("model_configs", {
  key: varchar("key", { length: 64 }).primaryKey(),
  label: varchar("label", { length: 120 }).notNull(),
  providerModelId: varchar("provider_model_id", { length: 120 }).notNull(),
  description: text("description").notNull(),
  enabled: boolean("enabled").notNull(),
  defaultSystemPrompt: text("default_system_prompt").notNull(),
  promptPrefix: text("prompt_prefix").notNull(),
  inputCostPer1k: numeric("input_cost_per_1k", {
    precision: 10,
    scale: 4,
  }).notNull(),
  outputCostPer1k: numeric("output_cost_per_1k", {
    precision: 10,
    scale: 4,
  }).notNull(),
  monthlyBudgetUsd: numeric("monthly_budget_usd", {
    precision: 10,
    scale: 2,
  }).notNull(),
  defaultForMembers: boolean("default_for_members").notNull(),
});

export const promptTemplates = pgTable("prompt_templates", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  category: varchar("category", { length: 48 }).notNull(),
  description: text("description").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
});

export const toolPolicies = pgTable("tool_policies", {
  id: varchar("id", { length: 64 }).primaryKey(),
  enabledTools: jsonb("enabled_tools").$type<string[]>().notNull(),
  allowedHttpDomains: jsonb("allowed_http_domains").$type<string[]>().notNull(),
});

export const usageEvents = pgTable("usage_events", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("user_id", { length: 64 }).notNull(),
  conversationId: varchar("conversation_id", { length: 64 }).notNull(),
  modelKey: varchar("model_key", { length: 64 }).notNull(),
  inputTokens: integer("input_tokens").notNull(),
  outputTokens: integer("output_tokens").notNull(),
  estimatedCostUsd: numeric("estimated_cost_usd", {
    precision: 10,
    scale: 4,
  }).notNull(),
  providerResponseId: varchar("provider_response_id", { length: 128 }).notNull(),
  latencyMs: integer("latency_ms").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
});

export const auditLogs = pgTable("audit_logs", {
  id: varchar("id", { length: 64 }).primaryKey(),
  actorId: varchar("actor_id", { length: 64 }).notNull(),
  action: varchar("action", { length: 64 }).notNull(),
  detail: text("detail").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
});
