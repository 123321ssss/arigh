import { revalidatePath } from "next/cache";

import { MemberWorkspaceShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Panel } from "@/components/ui/panel";
import { Select } from "@/components/ui/select";
import { requireUser } from "@/lib/auth/session";
import { appRepository } from "@/lib/data/repository";
import { formatDateTime } from "@/lib/utils";

export default async function ProfileSettingsPage() {
  const user = await requireUser();

  async function updateProfileAction(formData: FormData) {
    "use server";

    const currentUser = await requireUser();
    await appRepository.updateProfile(currentUser.id, {
      displayName: String(formData.get("displayName") ?? currentUser.displayName),
      language: String(formData.get("language") ?? currentUser.language),
    });
    await appRepository.addAuditLog(
      currentUser.id,
      "member.update",
      "成员更新了个人资料设置。",
    );
    revalidatePath("/settings/profile");
    revalidatePath("/app");
  }

  return (
    <MemberWorkspaceShell
      user={user}
      currentPath="/settings/profile"
      title="个人设置"
      subtitle="维护显示名、语言偏好和预算提醒认知，不暴露底层 provider 密钥。"
    >
      <Panel className="max-w-3xl space-y-6 p-6">
        <form action={updateProfileAction} className="grid gap-4">
          <div className="grid gap-2">
            <label className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
              显示名
            </label>
            <Input name="displayName" defaultValue={user.displayName} />
          </div>
          <div className="grid gap-2">
            <label className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
              语言
            </label>
            <Select name="language" defaultValue={user.language}>
              <option value="zh-CN">简体中文</option>
              <option value="en-US">English</option>
            </Select>
          </div>
          <div className="grid gap-3 rounded-[26px] border border-[rgba(19,31,30,0.08)] bg-[rgba(19,31,30,0.04)] p-4 text-sm text-[var(--muted)]">
            <p>邮箱: {user.email}</p>
            <p>角色: {user.role}</p>
            <p>预算上限: ${user.budget.monthlyUsdLimit.toFixed(2)}/月</p>
            <p>最近登录: {formatDateTime(user.recentLoginAt)}</p>
          </div>
          <div>
            <Button type="submit">保存设置</Button>
          </div>
        </form>
      </Panel>
    </MemberWorkspaceShell>
  );
}
