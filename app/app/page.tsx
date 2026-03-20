import Link from "next/link";
import { ArrowRight, Lightbulb, ShieldCheck } from "lucide-react";

import { MemberWorkspaceShell } from "@/components/app-shell";
import { ConversationRailCard } from "@/components/chat/conversation-rail";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { requireUser } from "@/lib/auth/session";
import { appRepository } from "@/lib/data/repository";
import { formatCurrency, formatNumber } from "@/lib/utils";

export default async function MemberHomePage() {
  const user = await requireUser();
  const [conversations, defaultModel, usageSummary] = await Promise.all([
    appRepository.listConversationsForUser(user.id),
    appRepository.getDefaultModel(),
    appRepository.getUsageSummary(user.id),
  ]);

  return (
    <MemberWorkspaceShell
      user={user}
      currentPath="/app"
      title="成员工作台"
      subtitle="对话、模型切换和执行轨迹都在同一个画布中完成。你可以先用低成本模型草拟，再切换高质量模型精修。"
    >
      <div className="grid gap-6 2xl:grid-cols-[360px_minmax(0,1fr)]">
        <div className="2xl:sticky 2xl:top-5 2xl:h-fit">
          <ConversationRailCard conversations={conversations} defaultModel={defaultModel} />
        </div>
        <div className="grid gap-6">
          <Panel className="space-y-6 p-6 md:p-8">
            <div className="space-y-3">
              <Badge>Workspace Overview</Badge>
              <h2 className="max-w-4xl font-[family-name:var(--font-display)] text-4xl text-[var(--ink-strong)] md:text-5xl">
                同一工作面里完成沟通、执行和记账
              </h2>
              <p className="max-w-4xl text-sm leading-8 text-[var(--muted)]">
                每次消息发送前都可选模型，系统会按真实调用模型写入 usage 和审计。你在成员区只看自己的正文，管理员默认只看聚合指标。
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <Panel className="rounded-[26px] bg-white/72 p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">活跃会话</p>
                <p className="mt-3 font-[family-name:var(--font-display)] text-3xl text-[var(--ink-strong)]">
                  {formatNumber(conversations.length)}
                </p>
              </Panel>
              <Panel className="rounded-[26px] bg-white/72 p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">本月成本</p>
                <p className="mt-3 font-[family-name:var(--font-display)] text-3xl text-[var(--ink-strong)]">
                  {formatCurrency(usageSummary.totalCostUsd)}
                </p>
              </Panel>
              <Panel className="rounded-[26px] bg-white/72 p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">预算上限</p>
                <p className="mt-3 font-[family-name:var(--font-display)] text-3xl text-[var(--ink-strong)]">
                  {formatCurrency(user.budget.monthlyUsdLimit)}
                </p>
              </Panel>
            </div>
            <div className="grid gap-4 xl:grid-cols-2">
              <Panel className="rounded-[28px] bg-[rgba(19,31,30,0.92)] p-6 text-[var(--paper)]">
                <div className="flex items-center gap-3">
                  <Lightbulb className="h-5 w-5 text-[var(--accent)]" />
                  <p className="text-lg font-semibold">推荐动作</p>
                </div>
                <p className="mt-3 text-sm leading-7 text-[rgba(255,252,244,0.74)]">
                  从最近会话继续，确认流式输出、逐消息模型切换和 Agent 工具轨迹都能顺畅协作。
                </p>
                <div className="mt-5">
                  <Link href={conversations[0] ? `/app/c/${conversations[0].id}` : "/app"}>
                    <Button>
                      打开最近会话
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </Panel>
              <Panel className="rounded-[28px] bg-white/74 p-6">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-[var(--danger)]" />
                  <p className="text-lg font-semibold text-[var(--ink-strong)]">隐私边界</p>
                </div>
                <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                  管理后台默认只看成员状态、用量、预算和审计事件，不提供 transcript 浏览器。正文和工具结果在应用层加密存储。
                </p>
              </Panel>
            </div>
          </Panel>
        </div>
      </div>
    </MemberWorkspaceShell>
  );
}
