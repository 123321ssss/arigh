"use client";

import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";

import type { Invite, SessionUser } from "@/lib/domain/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { formatDateTime } from "@/lib/utils";

export function MemberTable({
  members,
  invites,
}: {
  members: SessionUser[];
  invites: Invite[];
}) {
  const router = useRouter();
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"member" | "admin">("member");

  async function submitInvite() {
    if (!inviteEmail) {
      return;
    }

    await fetch("/api/admin/invites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
    });
    setInviteEmail("");
    startTransition(() => router.refresh());
  }

  async function updateMember(id: string, updates: Partial<SessionUser>) {
    await fetch(`/api/admin/members/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    startTransition(() => router.refresh());
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_auto]">
        <Input
          placeholder="邀请邮箱，例如 writer@company.com"
          value={inviteEmail}
          onChange={(event) => setInviteEmail(event.target.value)}
        />
        <Select
          value={inviteRole}
          onChange={(event) => setInviteRole(event.target.value as "member" | "admin")}
        >
          <option value="member">成员</option>
          <option value="admin">管理员</option>
        </Select>
        <Button type="button" onClick={submitInvite}>
          发送邀请
        </Button>
      </div>
      <div className="overflow-hidden rounded-[26px] border border-[rgba(19,31,30,0.08)]">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-[rgba(19,31,30,0.05)] text-left text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
            <tr>
              <th className="px-4 py-3">成员</th>
              <th className="px-4 py-3">角色</th>
              <th className="px-4 py-3">状态</th>
              <th className="px-4 py-3">预算</th>
              <th className="px-4 py-3">最近登录</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgba(19,31,30,0.08)] bg-white/75">
            {members.map((member) => (
              <tr key={member.id}>
                <td className="px-4 py-4">
                  <div>
                    <p className="font-medium text-[var(--ink-strong)]">{member.displayName}</p>
                    <p className="text-xs text-[var(--muted)]">{member.email}</p>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <Select
                    value={member.role}
                    onChange={(event) =>
                      updateMember(member.id, {
                        role: event.target.value as SessionUser["role"],
                      })
                    }
                  >
                    <option value="member">成员</option>
                    <option value="admin">管理员</option>
                  </Select>
                </td>
                <td className="px-4 py-4">
                  <Button
                    type="button"
                    variant={member.active ? "secondary" : "danger"}
                    size="sm"
                    onClick={() => updateMember(member.id, { active: !member.active })}
                  >
                    {member.active ? "已启用" : "已停用"}
                  </Button>
                </td>
                <td className="px-4 py-4 text-[var(--muted)]">
                  ${member.budget.monthlyUsdLimit.toFixed(2)}
                </td>
                <td className="px-4 py-4 text-[var(--muted)]">
                  {formatDateTime(member.recentLoginAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="rounded-[24px] border border-[rgba(19,31,30,0.08)] bg-[rgba(255,255,255,0.72)] p-4">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">邀请记录</p>
        <div className="mt-3 space-y-2 text-sm">
          {invites.map((invite) => (
            <div key={invite.id} className="flex items-center justify-between gap-3 rounded-2xl bg-[rgba(19,31,30,0.04)] px-4 py-3">
              <div>
                <p className="font-medium text-[var(--ink-strong)]">{invite.email}</p>
                <p className="text-xs text-[var(--muted)]">
                  {invite.role} · {invite.status}
                </p>
              </div>
              <p className="text-xs text-[var(--muted)]">{formatDateTime(invite.createdAt)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
