import type { UIMessage } from "ai";

import type {
  AgentRun,
  AuditLog,
  ConversationSummary,
  Invite,
  ModelConfig,
  PromptTemplate,
  SessionUser,
  StoredMessage,
  StoredMessagePayload,
  ToolPolicy,
  UsageEvent,
} from "@/lib/domain/types";
import { compactText } from "@/lib/utils";
import { encryptJson } from "@/lib/security/crypto";

export type DemoState = {
  profiles: SessionUser[];
  invites: Invite[];
  conversations: ConversationSummary[];
  messages: StoredMessage[];
  agentRuns: AgentRun[];
  models: ModelConfig[];
  prompts: PromptTemplate[];
  toolPolicy: ToolPolicy;
  usageEvents: UsageEvent[];
  auditLogs: AuditLog[];
};

const BASE_TIME = "2026-03-19T09:00:00+08:00";

function makeMessage(
  id: string,
  conversationId: string,
  role: "user" | "assistant" | "system",
  parts: UIMessage["parts"],
  createdAt: string,
): StoredMessage {
  const payload: StoredMessagePayload = { role, parts };

  return {
    id,
    conversationId,
    role,
    createdAt,
    encryptedPayload: encryptJson(payload),
  };
}

export function createDemoState(): DemoState {
  const profiles: SessionUser[] = [
    {
      id: "user-admin-1",
      email: "admin@editorial.local",
      displayName: "林策",
      role: "admin",
      language: "zh-CN",
      active: true,
      budget: {
        monthlyUsdLimit: 80,
        softWarningUsd: 60,
      },
      recentLoginAt: BASE_TIME,
      avatarUrl:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80",
    },
    {
      id: "user-member-1",
      email: "member@editorial.local",
      displayName: "沈知行",
      role: "member",
      language: "zh-CN",
      active: true,
      budget: {
        monthlyUsdLimit: 30,
        softWarningUsd: 20,
      },
      recentLoginAt: "2026-03-19T08:45:00+08:00",
      avatarUrl:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80",
    },
  ];

  const models: ModelConfig[] = [
    {
      key: "editorial-fast",
      label: "Editorial Fast",
      providerModelId: "gpt-5.4-mini",
      description: "低成本日常对话与摘要",
      enabled: true,
      defaultSystemPrompt:
        "你是内部编辑部 AI 助手。回答时保持清晰、可靠、具体，优先给出可执行结果。",
      promptPrefix: "请优先用简体中文回答，并用可执行建议收束。",
      inputCostPer1k: 0.0004,
      outputCostPer1k: 0.0016,
      monthlyBudgetUsd: 20,
      defaultForMembers: true,
    },
    {
      key: "editorial-quality",
      label: "Editorial Quality",
      providerModelId: "gpt-5.4-mini",
      description: "高质量写作、分析与多步推理",
      enabled: true,
      defaultSystemPrompt:
        "你是资深内部策略助手。需要输出结构化、审慎、可落地的中文答案。",
      promptPrefix: "如有不确定性，先说明假设再给建议。",
      inputCostPer1k: 0.002,
      outputCostPer1k: 0.008,
      monthlyBudgetUsd: 60,
      defaultForMembers: false,
    },
    {
      key: "editorial-reasoning",
      label: "Editorial Reasoning",
      providerModelId: "gpt-5.4-mini",
      description: "短任务 Agent 推理型模型",
      enabled: false,
      defaultSystemPrompt: "你是高谨慎度 Agent。",
      promptPrefix: "工具调用必须在必要时才触发。",
      inputCostPer1k: 0.003,
      outputCostPer1k: 0.012,
      monthlyBudgetUsd: 45,
      defaultForMembers: false,
    },
  ];

  const prompts: PromptTemplate[] = [
    {
      id: "tpl-editorial-brief",
      name: "编辑选题 Brief",
      category: "编辑",
      description: "将零散线索整理成选题 brief 与采访方向",
      content:
        "把输入内容整理成选题 brief。输出包含：核心判断、受众、风险点、采访问题、下步行动。",
      createdAt: "2026-03-18T16:10:00+08:00",
    },
    {
      id: "tpl-ops-retro",
      name: "运营复盘",
      category: "运营",
      description: "输出问题归因、增长洞察和行动建议",
      content:
        "请像运营负责人一样复盘，按现象、原因、证据、优先级建议四段输出。",
      createdAt: "2026-03-17T11:20:00+08:00",
    },
    {
      id: "tpl-eng-weekly",
      name: "研发周报",
      category: "研发",
      description: "把事项整理成研发周报模板",
      content:
        "整理为研发周报，输出本周完成、风险阻塞、下周计划、需协作事项。",
      createdAt: "2026-03-15T09:00:00+08:00",
    },
  ];

  const conversations: ConversationSummary[] = [
    {
      id: "conv-001",
      ownerId: "user-member-1",
      title: "AI 网关上线清单",
      status: "active",
      modelKey: "editorial-fast",
      estimatedCostUsd: 0.0842,
      messageCount: 4,
      lastPreview: "请把检查项压缩成值班用的上线卡片。",
      updatedAt: "2026-03-19T08:58:00+08:00",
    },
    {
      id: "conv-002",
      ownerId: "user-member-1",
      title: "管理台成员引导文案",
      status: "active",
      modelKey: "editorial-quality",
      estimatedCostUsd: 0.1932,
      messageCount: 2,
      lastPreview: "把管理员视角和成员视角的进入路径分别写清楚。",
      updatedAt: "2026-03-18T19:36:00+08:00",
    },
    {
      id: "conv-003",
      ownerId: "user-admin-1",
      title: "预算预警规则",
      status: "active",
      modelKey: "editorial-fast",
      estimatedCostUsd: 0.0315,
      messageCount: 2,
      lastPreview: "给我一版适合内部发布的预算预警说明。",
      updatedAt: "2026-03-19T07:40:00+08:00",
    },
  ];

  const messages: StoredMessage[] = [
    makeMessage(
      "msg-001",
      "conv-001",
      "user",
      [{ type: "text", text: "帮我整理一下这周 AI 网关的上线清单。" }],
      "2026-03-19T08:50:00+08:00",
    ),
    makeMessage(
      "msg-002",
      "conv-001",
      "assistant",
      [
        {
          type: "text",
          text: "我先按上线前、上线日、上线后三段整理，并把预算、防误配、告警回滚放进主清单。",
        },
      ],
      "2026-03-19T08:51:00+08:00",
    ),
    makeMessage(
      "msg-003",
      "conv-001",
      "user",
      [{ type: "text", text: "请把检查项压缩成值班用的上线卡片。" }],
      "2026-03-19T08:56:00+08:00",
    ),
    makeMessage(
      "msg-004",
      "conv-001",
      "assistant",
      [
        {
          type: "text",
          text: "上线卡片已经压缩为 10 项：域名、模型别名、预算阈值、密钥状态、SMTP、回调、日志、trace、熔断、回滚联系人。",
        },
      ],
      "2026-03-19T08:58:00+08:00",
    ),
    makeMessage(
      "msg-005",
      "conv-002",
      "user",
      [{ type: "text", text: "帮我写一版管理台成员引导文案。" }],
      "2026-03-18T19:30:00+08:00",
    ),
    makeMessage(
      "msg-006",
      "conv-002",
      "assistant",
      [
        {
          type: "text",
          text: "建议把首次进入拆成管理员和成员两条路径：管理员先配模型、预算与邀请；成员先创建会话并查看模板。",
        },
      ],
      "2026-03-18T19:36:00+08:00",
    ),
    makeMessage(
      "msg-007",
      "conv-003",
      "user",
      [{ type: "text", text: "给我一版适合内部发布的预算预警说明。" }],
      "2026-03-19T07:35:00+08:00",
    ),
    makeMessage(
      "msg-008",
      "conv-003",
      "assistant",
      [
        {
          type: "text",
          text: "预算预警分为软预警和硬阻断两层，默认分别在 75% 和 100% 触发，并同步记录审计日志。",
        },
      ],
      "2026-03-19T07:40:00+08:00",
    ),
  ];

  const agentRuns: AgentRun[] = [
    {
      id: "run-001",
      conversationId: "conv-001",
      status: "completed",
      modelKey: "editorial-fast",
      traceId: "trace-agent-001",
      startedAt: "2026-03-19T08:56:10+08:00",
      finishedAt: "2026-03-19T08:56:14+08:00",
      steps: [
        {
          id: "step-1",
          label: "读取模板",
          status: "completed",
          startedAt: "2026-03-19T08:56:10+08:00",
          finishedAt: "2026-03-19T08:56:11+08:00",
          detail: "命中提示词模板 `研发周报`，提炼上线值班清单结构。",
        },
        {
          id: "step-2",
          label: "压缩输出",
          status: "completed",
          startedAt: "2026-03-19T08:56:11+08:00",
          finishedAt: "2026-03-19T08:56:14+08:00",
          detail: "将长清单整理为 10 项上线卡片并补齐回滚联系人。",
        },
      ],
    },
  ];

  const usageEvents: UsageEvent[] = [
    {
      id: "usage-001",
      userId: "user-member-1",
      conversationId: "conv-001",
      modelKey: "editorial-fast",
      inputTokens: 643,
      outputTokens: 1123,
      estimatedCostUsd: 0.0842,
      providerResponseId: "resp_001",
      latencyMs: 2380,
      createdAt: "2026-03-19T08:58:00+08:00",
    },
    {
      id: "usage-002",
      userId: "user-member-1",
      conversationId: "conv-002",
      modelKey: "editorial-quality",
      inputTokens: 812,
      outputTokens: 1455,
      estimatedCostUsd: 0.1932,
      providerResponseId: "resp_002",
      latencyMs: 4120,
      createdAt: "2026-03-18T19:36:00+08:00",
    },
    {
      id: "usage-003",
      userId: "user-admin-1",
      conversationId: "conv-003",
      modelKey: "editorial-fast",
      inputTokens: 311,
      outputTokens: 504,
      estimatedCostUsd: 0.0315,
      providerResponseId: "resp_003",
      latencyMs: 1880,
      createdAt: "2026-03-19T07:40:00+08:00",
    },
    {
      id: "usage-004",
      userId: "user-member-1",
      conversationId: "conv-002",
      modelKey: "editorial-fast",
      inputTokens: 420,
      outputTokens: 690,
      estimatedCostUsd: 0.0496,
      providerResponseId: "resp_004",
      latencyMs: 1750,
      createdAt: "2026-03-17T16:20:00+08:00",
    },
    {
      id: "usage-005",
      userId: "user-member-1",
      conversationId: "conv-001",
      modelKey: "editorial-fast",
      inputTokens: 215,
      outputTokens: 388,
      estimatedCostUsd: 0.0252,
      providerResponseId: "resp_005",
      latencyMs: 1210,
      createdAt: "2026-03-16T10:15:00+08:00",
    },
  ];

  const auditLogs: AuditLog[] = [
    {
      id: "audit-001",
      actorId: "user-admin-1",
      action: "member.invite",
      detail: "邀请 `member@editorial.local` 进入成员工作区。",
      createdAt: "2026-03-18T18:15:00+08:00",
    },
    {
      id: "audit-002",
      actorId: "user-admin-1",
      action: "model.update",
      detail: "将 `Editorial Reasoning` 标记为停用。",
      createdAt: "2026-03-18T20:05:00+08:00",
    },
    {
      id: "audit-003",
      actorId: "user-member-1",
      action: "chat.stream",
      detail: "在会话 `AI 网关上线清单` 中发起了一次流式推理。",
      createdAt: "2026-03-19T08:58:00+08:00",
    },
  ];

  const invites: Invite[] = [
    {
      id: "invite-001",
      email: "member@editorial.local",
      role: "member",
      invitedBy: "user-admin-1",
      status: "accepted",
      createdAt: "2026-03-18T18:15:00+08:00",
    },
  ];

  return {
    profiles,
    invites,
    conversations: conversations.map((conversation) => ({
      ...conversation,
      lastPreview: compactText(conversation.lastPreview, 60),
    })),
    messages,
    agentRuns,
    models,
    prompts,
    toolPolicy: {
      enabledTools: [
        "calculator",
        "clock",
        "http_fetch_whitelist",
        "prompt_template_lookup",
      ],
      allowedHttpDomains: ["api.github.com", "openai.com", "vercel.com", "supabase.com"],
    },
    usageEvents,
    auditLogs,
  };
}
