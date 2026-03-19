import type { AuditLog } from "@/lib/domain/types";
import { Panel } from "@/components/ui/panel";
import { formatDateTime } from "@/lib/utils";

export function AuditFeed({ logs }: { logs: AuditLog[] }) {
  return (
    <Panel className="space-y-4 p-5">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
          Audit Feed
        </p>
        <h3 className="mt-1 font-[family-name:var(--font-display)] text-2xl text-[var(--ink-strong)]">
          最新审计事件
        </h3>
      </div>
      <div className="space-y-3">
        {logs.map((log) => (
          <div
            key={log.id}
            className="rounded-[22px] border border-[rgba(19,31,30,0.08)] bg-white/74 p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                {log.action}
              </p>
              <span className="text-xs text-[var(--muted)]">{formatDateTime(log.createdAt)}</span>
            </div>
            <p className="mt-2 text-sm leading-6 text-[var(--ink-strong)]">{log.detail}</p>
          </div>
        ))}
      </div>
    </Panel>
  );
}
