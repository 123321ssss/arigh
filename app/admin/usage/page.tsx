import { AdminWorkspaceShell } from "@/components/app-shell";
import { AdminPanel } from "@/components/admin/admin-panel";
import { UsagePanels } from "@/components/admin/usage-panels";
import { requireAdmin } from "@/lib/auth/session";
import { appRepository } from "@/lib/data/repository";

export default async function AdminUsagePage() {
  const admin = await requireAdmin();
  const summary = await appRepository.getUsageSummary();

  return (
    <AdminWorkspaceShell
      user={admin}
      currentPath="/admin/usage"
      title="用量与成本"
      subtitle="基于 usage_events 聚合，按天和按模型观察调用分布，适合预算巡检。"
    >
      <AdminPanel.Section title="用量面板" eyebrow="Usage Events">
        <UsagePanels summary={summary} />
      </AdminPanel.Section>
    </AdminWorkspaceShell>
  );
}
