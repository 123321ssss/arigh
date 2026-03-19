import { AdminWorkspaceShell } from "@/components/app-shell";
import { AdminPanel } from "@/components/admin/admin-panel";
import { MemberTable } from "@/components/admin/member-table";
import { requireAdmin } from "@/lib/auth/session";
import { appRepository } from "@/lib/data/repository";

export default async function AdminMembersPage() {
  const admin = await requireAdmin();
  const [members, invites] = await Promise.all([
    appRepository.listMembers(),
    appRepository.listInvites(),
  ]);

  return (
    <AdminWorkspaceShell
      user={admin}
      currentPath="/admin/members"
      title="成员与邀请"
      subtitle="采用邀请制账号管理。管理员可调整角色、启停成员，并追踪邀请状态。"
    >
      <AdminPanel.Section title="成员表" eyebrow="Accounts">
        <MemberTable members={members} invites={invites} />
      </AdminPanel.Section>
    </AdminWorkspaceShell>
  );
}
