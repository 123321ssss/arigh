import { Panel } from "@/components/ui/panel";
import { cn } from "@/lib/utils";

function Root({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-5">{children}</div>;
}

function Metrics({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{children}</div>;
}

function MetricCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <Panel className="space-y-2 p-5">
      <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">{label}</p>
      <p className="font-[family-name:var(--font-display)] text-3xl text-[var(--ink-strong)]">
        {value}
      </p>
      <p className="text-sm leading-6 text-[var(--muted)]">{hint}</p>
    </Panel>
  );
}

function Section({
  title,
  eyebrow,
  children,
  className,
}: {
  title: string;
  eyebrow: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Panel className={cn("space-y-4 p-5 md:p-6", className)}>
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">{eyebrow}</p>
        <h2 className="mt-1 font-[family-name:var(--font-display)] text-2xl text-[var(--ink-strong)]">
          {title}
        </h2>
      </div>
      {children}
    </Panel>
  );
}

export const AdminPanel = {
  Root,
  Metrics,
  MetricCard,
  Section,
};
