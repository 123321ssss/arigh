import { AdminWorkspaceShell } from "@/components/app-shell";
import { AdminPanel } from "@/components/admin/admin-panel";
import { MemberTable } from "@/components/admin/member-table";
import { requireAdmin } from "@/lib/auth/session";
import { appRepository } from "@/lib/data/repository";

export default async function AdminMembersPage() {
  const admin = await requireAdmin();
  const [members, inviteCodes] = await Promise.all([
    appRepository.listMembers(),
    appRepository.listInviteCodes(),
  ]);

  return (
    <AdminWorkspaceShell
      user={admin}
      currentPath="/admin/members"
      title="成员与邀请码"
      subtitle="管理员在这里维护成员状态、角色和邀请码。邀请码支持限制次数、有效期和邮箱域名，不再依赖邀请邮件。"
    >
      <AdminPanel.Section title="成员与准入" eyebrow="Accounts & Invite Codes">
        <MemberTable members={members} inviteCodes={inviteCodes} />
      </AdminPanel.Section>
    </AdminWorkspaceShell>
  );
}
