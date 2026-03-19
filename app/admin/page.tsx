import { AdminWorkspaceShell } from "@/components/app-shell";
import { AdminPanel } from "@/components/admin/admin-panel";
import { AuditFeed } from "@/components/admin/audit-feed";
import { UsagePanels } from "@/components/admin/usage-panels";
import { requireAdmin } from "@/lib/auth/session";
import { appRepository } from "@/lib/data/repository";
import { formatCurrency, formatNumber } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const admin = await requireAdmin();
  const [members, summary, logs, models] = await Promise.all([
    appRepository.listMembers(),
    appRepository.getUsageSummary(),
    appRepository.listAuditLogs(),
    appRepository.listModels(),
  ]);

  return (
    <AdminWorkspaceShell
      user={admin}
      currentPath="/admin"
      title="管理员总览"
      subtitle="在不读取成员正文的前提下，观察账号、模型、预算和审计面整体健康度。"
    >
      <AdminPanel.Root>
        <AdminPanel.Metrics>
          <AdminPanel.MetricCard
            label="成员数"
            value={formatNumber(members.length)}
            hint="当前工作区里已入驻的管理员和成员。"
          />
          <AdminPanel.MetricCard
            label="月度成本"
            value={formatCurrency(summary.totalCostUsd)}
            hint="按 usage_events 聚合估算。"
          />
          <AdminPanel.MetricCard
            label="请求量"
            value={formatNumber(summary.totalRequests)}
            hint="包含全部成员的流式调用。"
          />
          <AdminPanel.MetricCard
            label="启用模型"
            value={formatNumber(models.filter((model) => model.enabled).length)}
            hint="已开放给成员的模型数。"
          />
        </AdminPanel.Metrics>
        <AdminPanel.Section title="成本与模型" eyebrow="Usage">
          <UsagePanels summary={summary} />
        </AdminPanel.Section>
        <AuditFeed logs={logs.slice(0, 8)} />
      </AdminPanel.Root>
    </AdminWorkspaceShell>
  );
}
