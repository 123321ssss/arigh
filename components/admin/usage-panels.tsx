import { Panel } from "@/components/ui/panel";
import type { UsageSummary } from "@/lib/domain/types";
import { formatCurrency, formatNumber, formatRelativeMonth } from "@/lib/utils";

export function UsagePanels({ summary }: { summary: UsageSummary }) {
  const maxDaily = Math.max(...summary.daily.map((item) => item.costUsd), 0.01);

  return (
    <div className="grid gap-5 xl:grid-cols-[1.3fr_0.9fr]">
      <Panel className="space-y-4 p-5">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
            Daily Cost
          </p>
          <h3 className="mt-1 font-[family-name:var(--font-display)] text-2xl text-[var(--ink-strong)]">
            每日成本走势
          </h3>
        </div>
        <div className="space-y-3">
          {summary.daily.map((item) => (
            <div key={item.date} className="grid grid-cols-[52px_1fr_88px] items-center gap-3">
              <span className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                {formatRelativeMonth(item.date)}
              </span>
              <div className="h-3 rounded-full bg-[rgba(19,31,30,0.08)]">
                <div
                  className="h-3 rounded-full bg-[var(--accent)]"
                  style={{ width: `${(item.costUsd / maxDaily) * 100}%` }}
                />
              </div>
              <span className="text-sm text-[var(--ink-strong)]">{formatCurrency(item.costUsd)}</span>
            </div>
          ))}
        </div>
      </Panel>
      <Panel className="space-y-4 p-5">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
            Model Mix
          </p>
          <h3 className="mt-1 font-[family-name:var(--font-display)] text-2xl text-[var(--ink-strong)]">
            模型占比
          </h3>
        </div>
        <div className="space-y-3">
          {summary.byModel.map((item) => (
            <div
              key={item.modelKey}
              className="rounded-[22px] border border-[rgba(19,31,30,0.08)] bg-white/72 p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-[var(--ink-strong)]">{item.modelKey}</p>
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                  {item.requests} 次
                </p>
              </div>
              <div className="mt-2 flex items-end justify-between gap-3">
                <p className="font-[family-name:var(--font-display)] text-2xl text-[var(--ink-strong)]">
                  {formatCurrency(item.costUsd)}
                </p>
                <p className="text-xs text-[var(--muted)]">{formatNumber(item.requests)} requests</p>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
