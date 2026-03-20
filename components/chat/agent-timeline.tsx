import { AlertTriangle, CheckCircle2, Clock3, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Panel } from "@/components/ui/panel";
import type { AgentRun } from "@/lib/domain/types";
import { formatDateTime } from "@/lib/utils";

function statusIcon(status: AgentRun["status"] | AgentRun["steps"][number]["status"]) {
  if (status === "completed") {
    return <CheckCircle2 className="h-4 w-4 text-[var(--accent)]" />;
  }

  if (status === "failed") {
    return <AlertTriangle className="h-4 w-4 text-[var(--danger)]" />;
  }

  return <Clock3 className="h-4 w-4 text-[var(--muted)]" />;
}

function Root({ children }: { children: React.ReactNode }) {
  return <Panel className="space-y-4 p-5">{children}</Panel>;
}

function RunCard({ run }: { run: AgentRun }) {
  return (
    <div className="rounded-[26px] border border-[rgba(19,31,30,0.08)] bg-white/75 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-[var(--ink-strong)]">
            <Sparkles className="h-4 w-4 text-[var(--accent)]" />
            <span>{run.traceId}</span>
          </div>
          <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
            {run.modelKey} / {formatDateTime(run.startedAt)}
          </p>
        </div>
        <Badge>{run.status}</Badge>
      </div>
      <div className="mt-4 space-y-3">
        {run.steps.map((step) => (
          <div
            key={step.id}
            className="rounded-[22px] border border-[rgba(19,31,30,0.08)] bg-[rgba(255,252,244,0.86)] p-3"
          >
            <div className="flex items-center gap-2 text-sm font-medium text-[var(--ink-strong)]">
              {statusIcon(step.status)}
              <span>{step.label}</span>
            </div>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{step.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export const AgentTimeline = {
  Root,
  RunCard,
};

export function AgentTimelineCard({ runs }: { runs: AgentRun[] }) {
  return (
    <AgentTimeline.Root>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
            Agent Trace
          </p>
          <h3 className="mt-1 font-[family-name:var(--font-display)] text-2xl text-[var(--ink-strong)]">
            执行轨迹
          </h3>
        </div>
        <Badge>{runs.length} 次运行</Badge>
      </div>
      <div className="space-y-3">
        {runs.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-[rgba(19,31,30,0.12)] p-5 text-sm leading-7 text-[var(--muted)]">
            当前会话还没有工具调用。启用模板查询、白名单抓取或计算工具后，这里会出现完整轨迹。
          </div>
        ) : null}
        {runs.map((run) => (
          <AgentTimeline.RunCard key={run.id} run={run} />
        ))}
      </div>
    </AgentTimeline.Root>
  );
}
