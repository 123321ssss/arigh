import { AdminWorkspaceShell } from "@/components/app-shell";
import { AdminPanel } from "@/components/admin/admin-panel";
import { AuditFeed } from "@/components/admin/audit-feed";
import { UsagePanels } from "@/components/admin/usage-panels";
import { requireAdmin } from "@/lib/auth/session";
import { appRepository } from "@/lib/data/repository";
import { formatCurrency, formatNumber } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const admin = await requireAdmin();
  const [members, summary, logs, models, inviteCodes] = await Promise.all([
    appRepository.listMembers(),
    appRepository.getUsageSummary(),
    appRepository.listAuditLogs(),
    appRepository.listModels(),
    appRepository.listInviteCodes(),
  ]);

  return (
    <AdminWorkspaceShell
      user={admin}
      currentPath="/admin"
      title="管理员总览"
      subtitle="在不读取成员正文的前提下，统一观察账号、邀请码、模型、预算和审计流的整体健康度。"
    >
      <AdminPanel.Root>
        <AdminPanel.Metrics>
          <AdminPanel.MetricCard
            label="成员数"
            value={formatNumber(members.length)}
            hint="当前工作台里的管理员和成员总数。"
          />
          <AdminPanel.MetricCard
            label="可用邀请码"
            value={formatNumber(inviteCodes.filter((inviteCode) => inviteCode.status === "active").length)}
            hint="当前仍可注册的新邀请码数量。"
          />
          <AdminPanel.MetricCard
            label="月度成本"
            value={formatCurrency(summary.totalCostUsd)}
            hint="按 usage_events 聚合估算。"
          />
          <AdminPanel.MetricCard
            label="启用模型"
            value={formatNumber(models.filter((model) => model.enabled).length)}
            hint="当前开放给成员的模型数量。"
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
