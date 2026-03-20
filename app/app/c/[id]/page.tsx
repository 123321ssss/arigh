import Link from "next/link";
import { Bot, LayoutList, Settings2, Sparkles } from "lucide-react";
import { redirect } from "next/navigation";

import { AvatarChip } from "@/components/ui/avatar-chip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { AgentChatWorkspace } from "@/components/chat/chat-composer";
import { ConversationRailCard } from "@/components/chat/conversation-rail";
import { requireUser } from "@/lib/auth/session";
import { appRepository } from "@/lib/data/repository";
import { formatCurrency } from "@/lib/utils";

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
    <div className="relative h-screen overflow-hidden bg-[var(--paper)] p-3 md:p-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(31,159,151,0.16),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(184,86,74,0.12),transparent_30%)]" />
      <div className="relative mx-auto grid h-full w-full max-w-[1860px] min-h-0 gap-3 xl:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="min-h-0 flex flex-col gap-3">
          <div className="min-h-0 flex-1">
            <ConversationRailCard
              conversations={conversations}
              selectedConversationId={conversation.id}
              defaultModel={defaultModel}
            />
          </div>
          <Panel className="shrink-0 space-y-4 p-4">
            <div className="flex items-center gap-3">
              <AvatarChip image={user.avatarUrl} fallback={user.displayName.slice(0, 1)} />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[var(--ink-strong)]">
                  {user.displayName}
                </p>
                <p className="truncate text-xs text-[var(--muted)]">{user.email}</p>
              </div>
            </div>
            <div className="rounded-2xl border border-[rgba(19,31,30,0.1)] bg-white/72 px-3 py-2 text-xs text-[var(--muted)]">
              本月预算 {formatCurrency(user.budget.monthlyUsdLimit)}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/app">
                <Button variant="ghost" className="w-full rounded-2xl border border-[rgba(19,31,30,0.12)]">
                  <LayoutList className="h-4 w-4" />
                  会话页
                </Button>
              </Link>
              <Link href="/settings/profile">
                <Button variant="ghost" className="w-full rounded-2xl border border-[rgba(19,31,30,0.12)]">
                  <Settings2 className="h-4 w-4" />
                  设置
                </Button>
              </Link>
            </div>
            <form action="/api/auth/logout" method="post">
              <Button variant="secondary" className="w-full rounded-2xl">
                退出登录
              </Button>
            </form>
          </Panel>
        </aside>
        <section className="min-h-0 flex flex-col gap-3">
          <Panel className="shrink-0 p-4 md:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge>Conversation</Badge>
                  <Badge className="border-[rgba(19,31,30,0.12)] bg-white/70">
                    最近模型 {conversation.lastUsedModelKey}
                  </Badge>
                </div>
                <h1 className="font-[family-name:var(--font-display)] text-3xl text-[var(--ink-strong)]">
                  {conversation.title}
                </h1>
                <p className="text-sm text-[var(--muted)]">
                  右上为模型与对话流，右下为输入区。页面固定在一个画面内，滚动仅发生在消息区和左侧会话目录。
                </p>
              </div>
              <div className="grid gap-2 text-right">
                <div className="inline-flex items-center justify-end gap-2 text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                  <Bot className="h-3.5 w-3.5" />
                  可用模型 {models.filter((item) => item.enabled).length}
                </div>
                <div className="inline-flex items-center justify-end gap-2 text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                  <Sparkles className="h-3.5 w-3.5" />
                  Agent runs {runs.length}
                </div>
              </div>
            </div>
          </Panel>
          <div className="min-h-0 flex-1">
            <AgentChatWorkspace
              conversationId={conversation.id}
              initialMessages={messages}
              models={models.filter((model) => model.enabled)}
              prompts={prompts}
              user={user}
              defaultModelKey={conversation.lastUsedModelKey}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
