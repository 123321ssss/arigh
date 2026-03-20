import { AdminWorkspaceShell } from "@/components/app-shell";
import { AdminPanel } from "@/components/admin/admin-panel";
import { AuditFeed } from "@/components/admin/audit-feed";
import { requireAdmin } from "@/lib/auth/session";
import { appRepository } from "@/lib/data/repository";

export default async function AdminAuditPage() {
  const admin = await requireAdmin();
  const logs = await appRepository.listAuditLogs();

  return (
    <AdminWorkspaceShell
      user={admin}
      currentPath="/admin/audit"
      title="审计日志"
      subtitle="记录初始化、注册、登录、邀请码、成员变更、模型变更与对话触发事件，用于最小必要的内部审计。"
    >
      <AdminPanel.Section title="审计流" eyebrow="Audit Logs">
        <AuditFeed logs={logs} />
      </AdminPanel.Section>
    </AdminWorkspaceShell>
  );
}
