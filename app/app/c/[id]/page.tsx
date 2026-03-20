import { redirect } from "next/navigation";

import { MemberWorkspaceShell } from "@/components/app-shell";
import { AgentTimelineCard } from "@/components/chat/agent-timeline";
import { AgentChatWorkspace } from "@/components/chat/chat-composer";
import { ConversationRailCard } from "@/components/chat/conversation-rail";
import { requireUser } from "@/lib/auth/session";
import { appRepository } from "@/lib/data/repository";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  const [conversation, conversations, models, prompts, messages, runs, defaultModel] =
    await Promise.all([
      appRepository.getConversationForUser(id, user.id),
      appRepository.listConversationsForUser(user.id),
      appRepository.listModels(),
      appRepository.listPromptTemplates(),
      appRepository.listMessagesForConversation(id, user.id),
      appRepository.listAgentRuns(id, user.id),
      appRepository.getDefaultModel(),
    ]);

  if (!conversation) {
    redirect("/app");
  }

  return (
    <MemberWorkspaceShell
      user={user}
      currentPath="/app"
      title={conversation.title}
      subtitle="在同一条会话中完成消息流、逐条模型切换和 Agent 工具执行。布局已经调整为宽画布，避免核心内容被挤压。"
    >
      <div className="grid gap-6 2xl:grid-cols-[340px_minmax(0,1fr)]">
        <div className="2xl:sticky 2xl:top-5 2xl:h-fit">
          <ConversationRailCard
            conversations={conversations}
            selectedConversationId={conversation.id}
            defaultModel={defaultModel}
          />
        </div>
        <div className="grid gap-6">
          <AgentChatWorkspace
            conversationId={conversation.id}
            initialMessages={messages}
            models={models.filter((model) => model.enabled)}
            prompts={prompts}
            user={user}
            defaultModelKey={conversation.lastUsedModelKey}
          />
          <AgentTimelineCard runs={runs} />
        </div>
      </div>
    </MemberWorkspaceShell>
  );
}
