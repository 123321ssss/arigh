import Link from "next/link";
import { ArrowRight, Lightbulb, ShieldCheck } from "lucide-react";

import { MemberWorkspaceShell } from "@/components/app-shell";
import { ConversationRailCard } from "@/components/chat/conversation-rail";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { Badge } from "@/components/ui/badge";
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
      subtitle="从左侧会话目录进入已有任务，或新建一条对话开始一次新的内部协作。"
    >
      <div className="grid gap-5 xl:grid-cols-[340px_minmax(0,1fr)]">
        <ConversationRailCard conversations={conversations} defaultModel={defaultModel} />
        <div className="grid gap-5">
          <Panel className="space-y-5 p-6">
            <Badge>Workspace Overview</Badge>
            <div className="space-y-3">
              <h2 className="font-[family-name:var(--font-display)] text-4xl text-[var(--ink-strong)]">
                对话、模板与 Agent，在同一个工作面里协作
              </h2>
              <p className="max-w-3xl text-sm leading-8 text-[var(--muted)]">
                这版原型默认按成员最常见的流程组织: 先进入会话，再在同页完成模型选择、模板引用和流式执行。管理员无法从后台直接查看你的正文内容。
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <Panel className="rounded-[26px] bg-white/72 p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
                  活跃会话
                </p>
                <p className="mt-3 font-[family-name:var(--font-display)] text-3xl text-[var(--ink-strong)]">
                  {formatNumber(conversations.length)}
                </p>
              </Panel>
              <Panel className="rounded-[26px] bg-white/72 p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
                  本月成本
                </p>
                <p className="mt-3 font-[family-name:var(--font-display)] text-3xl text-[var(--ink-strong)]">
                  {formatCurrency(usageSummary.totalCostUsd)}
                </p>
              </Panel>
              <Panel className="rounded-[26px] bg-white/72 p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
                  预算上限
                </p>
                <p className="mt-3 font-[family-name:var(--font-display)] text-3xl text-[var(--ink-strong)]">
                  {formatCurrency(user.budget.monthlyUsdLimit)}
                </p>
              </Panel>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <Panel className="rounded-[28px] bg-[rgba(19,31,30,0.92)] p-5 text-[var(--paper)]">
                <div className="flex items-center gap-3">
                  <Lightbulb className="h-5 w-5 text-[var(--accent)]" />
                  <p className="text-lg font-semibold">推荐动作</p>
                </div>
                <p className="mt-3 text-sm leading-7 text-[rgba(255,252,244,0.72)]">
                  直接打开最近一条会话，验证流式输出、会话历史、Agent 轨迹和成本记账是否连通。
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
              <Panel className="rounded-[28px] bg-white/74 p-5">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-[var(--danger)]" />
                  <p className="text-lg font-semibold text-[var(--ink-strong)]">隐私边界</p>
                </div>
                <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                  管理台默认只看账号、用量、会话标题和审计事件，不提供 transcript viewer。成员区的正文与工具结果按应用层加密存储。
                </p>
              </Panel>
            </div>
          </Panel>
        </div>
      </div>
    </MemberWorkspaceShell>
  );
}
