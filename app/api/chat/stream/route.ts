import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  type UIMessage,
} from "ai";
import { NextResponse } from "next/server";

import { checkBudgetAllowance, estimateTextCost } from "@/lib/ai/costs";
import { createMockChatResponse } from "@/lib/ai/mock-response";
import { getLanguageModel } from "@/lib/ai/provider";
import { buildToolSet } from "@/lib/ai/tools";
import { getCurrentUser } from "@/lib/auth/session";
import { appRepository } from "@/lib/data/repository";
import type { AgentRun, AgentRunStatus, MessageMeta, ModelConfig } from "@/lib/domain/types";
import { isAiConfigured } from "@/lib/env";

function latestRoleText(messages: UIMessage[], role: UIMessage["role"]) {
  const lastMessage = [...messages].reverse().find((message) => message.role === role);

  if (!lastMessage) {
    return "";
  }

  return lastMessage.parts
    .map((part) => (part.type === "text" ? part.text : ""))
    .join("\n")
    .trim();
}

function approxTokens(input: string) {
  return Math.max(1, Math.ceil(input.length * 1.2));
}

function buildMockText(params: {
  question: string;
  promptName?: string;
  modelLabel: string;
}) {
  return [
    `当前未接入真实 AI provider，已切到本地演示流，当前模型为 ${params.modelLabel}。`,
    params.promptName ? `本次回答参考了提示模板《${params.promptName}》。` : "本次回答未使用提示模板。",
    `你的问题是：${params.question}`,
    "建议输出结构：",
    "1. 先给出可执行结论。",
    "2. 再按风险、优先级和行动项压缩。",
    "3. 如需复盘成本或模型策略，再补一段预算提醒。",
  ].join("\n");
}

function decorateMessagesWithModel(
  uiMessages: UIMessage[],
  model: ModelConfig,
  promptTemplateId?: string | null,
) {
  const nextMessages = uiMessages.map((message) => ({ ...message }));
  const metadata: MessageMeta = {
    modelKey: model.key,
    modelLabel: model.label,
    promptTemplateId: promptTemplateId ?? null,
  };

  for (let index = nextMessages.length - 1; index >= 0; index -= 1) {
    const message = nextMessages[index];
    if (message.role !== "assistant") {
      continue;
    }

    nextMessages[index] = {
      ...message,
      metadata: {
        ...(message.metadata && typeof message.metadata === "object"
          ? (message.metadata as Record<string, unknown>)
          : {}),
        ...metadata,
      },
    };
    break;
  }

  return nextMessages;
}

function makeAgentRun(params: {
  conversationId: string;
  modelKey: string;
  traceId: string;
  steps: AgentRun["steps"];
  status: AgentRunStatus;
  startedAt: string;
  finishedAt?: string;
}) {
  return {
    id: crypto.randomUUID(),
    conversationId: params.conversationId,
    modelKey: params.modelKey,
    traceId: params.traceId,
    status: params.status,
    startedAt: params.startedAt,
    finishedAt: params.finishedAt,
    steps: params.steps,
  } satisfies AgentRun;
}

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    messages?: UIMessage[];
    conversationId?: string;
    modelKey?: string;
    promptTemplateId?: string | null;
  };

  const uiMessages = body.messages ?? [];

  if (!body.conversationId || uiMessages.length === 0) {
    return NextResponse.json({ error: "Invalid chat payload." }, { status: 400 });
  }

  const conversation = await appRepository.getConversationForUser(body.conversationId, user.id);
  if (!conversation) {
    return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
  }

  const [model, promptTemplate, usageSummary, tools] = await Promise.all([
    appRepository.getModel(body.modelKey ?? conversation.lastUsedModelKey),
    appRepository.getPromptTemplate(body.promptTemplateId),
    appRepository.getUsageSummary(user.id),
    buildToolSet(),
  ]);

  if (!model || !model.enabled) {
    return NextResponse.json({ error: "Selected model is unavailable." }, { status: 400 });
  }

  const budget = checkBudgetAllowance({
    user,
    summary: usageSummary,
    model,
  });

  if (budget.blocked) {
    return NextResponse.json({ error: budget.message }, { status: 429 });
  }

  const question = latestRoleText(uiMessages, "user");
  await appRepository.saveConversationSnapshot({
    conversationId: conversation.id,
    userId: user.id,
    modelKey: model.key,
    messages: uiMessages,
  });

  const startedAt = new Date().toISOString();
  const traceId = crypto.randomUUID();
  const agentSteps: AgentRun["steps"] = [];

  if (!isAiConfigured()) {
    const responseText = buildMockText({
      question,
      promptName: promptTemplate?.name,
      modelLabel: model.label,
    });
    const inputTokens = approxTokens(question);
    const outputTokens = approxTokens(responseText);
    const estimatedCostUsd = estimateTextCost({
      model,
      inputTokens,
      outputTokens,
    });
    const mock = createMockChatResponse({
      originalMessages: uiMessages,
      responseText,
    });
    const finalMessages = decorateMessagesWithModel(
      mock.messages,
      model,
      body.promptTemplateId,
    );

    agentSteps.push({
      id: crypto.randomUUID(),
      label: promptTemplate ? "模板整理" : "演示回答",
      status: "completed",
      startedAt,
      finishedAt: new Date().toISOString(),
      detail: promptTemplate
        ? `参考模板《${promptTemplate.name}》生成本地演示回答。`
        : "当前未接入真实 AI provider，返回本地演示流。",
    });

    await Promise.all([
      appRepository.saveConversationSnapshot({
        conversationId: conversation.id,
        userId: user.id,
        modelKey: model.key,
        messages: finalMessages,
        estimatedCostUsd,
      }),
      appRepository.saveAgentRun(
        makeAgentRun({
          conversationId: conversation.id,
          modelKey: model.key,
          traceId,
          status: "completed",
          startedAt,
          finishedAt: new Date().toISOString(),
          steps: agentSteps,
        }),
      ),
      appRepository.createUsageEvent({
        id: crypto.randomUUID(),
        userId: user.id,
        conversationId: conversation.id,
        modelKey: model.key,
        inputTokens,
        outputTokens,
        estimatedCostUsd,
        providerResponseId: traceId,
        latencyMs: 320,
        createdAt: new Date().toISOString(),
      }),
      appRepository.addAuditLog(
        user.id,
        "chat.stream",
        `在会话《${conversation.title}》中触发了 ${model.label} 的本地演示流。`,
      ),
    ]);

    return mock.response;
  }

  const languageModel = getLanguageModel(model);
  if (!languageModel) {
    return NextResponse.json({ error: "AI provider not configured." }, { status: 500 });
  }

  const modelMessages = await convertToModelMessages(
    uiMessages.map((message) => ({
      role: message.role,
      metadata: message.metadata,
      parts: message.parts,
    })),
    { tools },
  );
  let finalUsage:
    | {
        inputTokens?: number;
        outputTokens?: number;
      }
    | undefined;
  let providerResponseId = traceId;

  const result = streamText({
    model: languageModel,
    messages: modelMessages,
    system: [model.defaultSystemPrompt, model.promptPrefix, promptTemplate?.content]
      .filter(Boolean)
      .join("\n\n"),
    tools,
    maxRetries: 1,
    stopWhen: stepCountIs(4),
    onStepFinish(step) {
      if (step.toolCalls.length > 0) {
        for (const toolCall of step.toolCalls) {
          const matchingResult = step.toolResults.find(
            (resultItem) => resultItem.toolCallId === toolCall.toolCallId,
          );
          agentSteps.push({
            id: crypto.randomUUID(),
            label: toolCall.toolName,
            status: matchingResult ? "completed" : "running",
            startedAt: new Date().toISOString(),
            finishedAt: matchingResult ? new Date().toISOString() : undefined,
            detail: matchingResult
              ? `输入 ${JSON.stringify(toolCall.input)}，输出 ${JSON.stringify(matchingResult.output).slice(0, 220)}`
              : `已发起工具调用 ${toolCall.toolName}。`,
          });
        }
      } else if (step.text) {
        agentSteps.push({
          id: crypto.randomUUID(),
          label: `step-${step.stepNumber + 1}`,
          status: "completed",
          startedAt: new Date().toISOString(),
          finishedAt: new Date().toISOString(),
          detail: step.text.slice(0, 220),
        });
      }
    },
    onFinish(event) {
      finalUsage = event.totalUsage as { inputTokens?: number; outputTokens?: number };
      providerResponseId = ((event.response as { id?: string }).id ?? traceId) as string;
    },
  });

  return result.toUIMessageStreamResponse({
    originalMessages: uiMessages,
    onFinish: async ({ messages }) => {
      const inputTokens = finalUsage?.inputTokens ?? approxTokens(question);
      const outputTokens =
        finalUsage?.outputTokens ??
        approxTokens(latestRoleText(messages, "assistant"));
      const estimatedCostUsd = estimateTextCost({
        model,
        inputTokens,
        outputTokens,
      });
      const finalMessages = decorateMessagesWithModel(messages, model, body.promptTemplateId);

      await Promise.all([
        appRepository.saveConversationSnapshot({
          conversationId: conversation.id,
          userId: user.id,
          modelKey: model.key,
          messages: finalMessages,
          estimatedCostUsd,
        }),
        appRepository.saveAgentRun(
          makeAgentRun({
            conversationId: conversation.id,
            modelKey: model.key,
            traceId,
            status: "completed",
            startedAt,
            finishedAt: new Date().toISOString(),
            steps: agentSteps,
          }),
        ),
        appRepository.createUsageEvent({
          id: crypto.randomUUID(),
          userId: user.id,
          conversationId: conversation.id,
          modelKey: model.key,
          inputTokens,
          outputTokens,
          estimatedCostUsd,
          providerResponseId,
          latencyMs: 1800,
          createdAt: new Date().toISOString(),
        }),
        appRepository.addAuditLog(
          user.id,
          "chat.stream",
          `在会话《${conversation.title}》中完成了一次 ${model.label} 调用。`,
        ),
      ]);
    },
  });
}
