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
      subtitle="消息流、模型选择、模板引用和 Agent 轨迹在同一张工作台里协同更新。"
      aside={<AgentTimelineCard runs={runs} />}
    >
      <div className="grid gap-5 xl:grid-cols-[340px_minmax(0,1fr)]">
        <ConversationRailCard
          conversations={conversations}
          selectedConversationId={conversation.id}
          defaultModel={defaultModel}
        />
        <AgentChatWorkspace
          conversationId={conversation.id}
          initialMessages={messages}
          models={models.filter((model) => model.enabled)}
          prompts={prompts}
          user={user}
          defaultModelKey={conversation.modelKey}
        />
      </div>
    </MemberWorkspaceShell>
  );
}
