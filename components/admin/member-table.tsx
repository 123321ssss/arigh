"use client";

import { startTransition, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Link2, ShieldBan } from "lucide-react";

import type { InviteCode, SessionUser } from "@/lib/domain/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { formatDateTime } from "@/lib/utils";

type InviteCreatePayload = {
  role: "member" | "admin";
  maxUses: number;
  expiresAt?: string | null;
  allowedEmailDomain?: string | null;
  note?: string | null;
};

async function copyText(value: string) {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
  }
}

export function MemberTable({
  members,
  inviteCodes,
}: {
  members: SessionUser[];
  inviteCodes: InviteCode[];
}) {
  const router = useRouter();
  const [inviteRole, setInviteRole] = useState<"member" | "admin">("member");
  const [maxUses, setMaxUses] = useState("1");
  const [expiresAt, setExpiresAt] = useState("");
  const [allowedEmailDomain, setAllowedEmailDomain] = useState("");
  const [note, setNote] = useState("");
  const [inviteMessage, setInviteMessage] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [lastInviteCode, setLastInviteCode] = useState<InviteCode | null>(null);
  const [lastRegisterUrl, setLastRegisterUrl] = useState<string | null>(null);
  const [submittingInvite, setSubmittingInvite] = useState(false);

  const shareText = useMemo(() => {
    if (!lastInviteCode?.code) {
      return null;
    }

    return `${lastInviteCode.code}${lastRegisterUrl ? `\n${lastRegisterUrl}` : ""}`;
  }, [lastInviteCode, lastRegisterUrl]);

  async function submitInviteCode() {
    setSubmittingInvite(true);
    setInviteError(null);
    setInviteMessage(null);

    const payload: InviteCreatePayload = {
      role: inviteRole,
      maxUses: Number(maxUses || "1"),
      expiresAt: expiresAt || null,
      allowedEmailDomain: allowedEmailDomain.trim() || null,
      note: note.trim() || null,
    };

    const response = await fetch("/api/admin/invite-codes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const body = (await response.json().catch(() => null)) as
      | { error?: string; inviteCode?: InviteCode; registerUrl?: string }
      | null;

    setSubmittingInvite(false);

    if (!response.ok || !body?.inviteCode) {
      setInviteError(body?.error ?? "邀请码生成失败，请稍后重试。");
      return;
    }

    setLastInviteCode(body.inviteCode);
    setLastRegisterUrl(body.registerUrl ?? null);
    setInviteMessage(`邀请码 ${body.inviteCode.codePreview} 已生成，可直接复制给成员。`);
    setNote("");
    setAllowedEmailDomain("");
    setExpiresAt("");
    setMaxUses("1");
    startTransition(() => router.refresh());
  }

  async function revokeInviteCode(id: string) {
    const response = await fetch(`/api/admin/invite-codes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "revoked" }),
    });

    if (!response.ok) {
      return;
    }

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
    <div className="space-y-8">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
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

        <div className="space-y-4 rounded-[26px] border border-[rgba(19,31,30,0.08)] bg-white/82 p-5">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
              Generate Invite
            </p>
            <h3 className="mt-2 text-lg font-semibold text-[var(--ink-strong)]">生成邀请码</h3>
          </div>
          <div className="grid gap-3">
            <Select
              value={inviteRole}
              onChange={(event) => setInviteRole(event.target.value as "member" | "admin")}
            >
              <option value="member">成员</option>
              <option value="admin">管理员</option>
            </Select>
            <Input
              type="number"
              min="1"
              value={maxUses}
              onChange={(event) => setMaxUses(event.target.value)}
              placeholder="可使用次数"
            />
            <Input
              type="datetime-local"
              value={expiresAt}
              onChange={(event) => setExpiresAt(event.target.value)}
            />
            <Input
              value={allowedEmailDomain}
              onChange={(event) => setAllowedEmailDomain(event.target.value)}
              placeholder="限制邮箱域名，例如 company.com"
            />
            <Input
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="备注"
            />
            <Button type="button" onClick={submitInviteCode} disabled={submittingInvite}>
              {submittingInvite ? "生成中..." : "生成邀请码"}
            </Button>
          </div>
          {inviteMessage ? <p className="text-sm text-emerald-700">{inviteMessage}</p> : null}
          {inviteError ? <p className="text-sm text-rose-600">{inviteError}</p> : null}
          {lastInviteCode?.code ? (
            <div className="space-y-3 rounded-[22px] border border-[rgba(50,156,149,0.18)] bg-[rgba(50,156,149,0.08)] p-4">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
                  Latest Invite
                </p>
                <p className="mt-2 font-mono text-sm text-[var(--ink-strong)]">
                  {lastInviteCode.code}
                </p>
              </div>
              <div className="grid gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => copyText(lastInviteCode.code ?? "")}
                >
                  <Copy className="h-4 w-4" />
                  复制邀请码
                </Button>
                {lastRegisterUrl ? (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => copyText(lastRegisterUrl)}
                  >
                    <Link2 className="h-4 w-4" />
                    复制注册链接
                  </Button>
                ) : null}
                {shareText ? (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => copyText(shareText)}
                  >
                    <Copy className="h-4 w-4" />
                    复制邀请码与链接
                  </Button>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="rounded-[24px] border border-[rgba(19,31,30,0.08)] bg-[rgba(255,255,255,0.72)] p-4">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">邀请码记录</p>
        <div className="mt-3 space-y-2 text-sm">
          {inviteCodes.map((inviteCode) => (
            <div
              key={inviteCode.id}
              className="grid gap-3 rounded-2xl bg-[rgba(19,31,30,0.04)] px-4 py-3 md:grid-cols-[minmax(0,1fr)_auto_auto]"
            >
              <div>
                <p className="font-medium text-[var(--ink-strong)]">{inviteCode.codePreview}</p>
                <p className="text-xs text-[var(--muted)]">
                  {inviteCode.role} / {inviteCode.status} / {inviteCode.usedCount}
                  {" / "}
                  {inviteCode.maxUses}
                  {inviteCode.allowedEmailDomain ? ` / ${inviteCode.allowedEmailDomain}` : ""}
                </p>
                {inviteCode.note ? (
                  <p className="mt-1 text-xs text-[var(--muted)]">{inviteCode.note}</p>
                ) : null}
              </div>
              <div className="text-xs text-[var(--muted)]">
                <p>创建于 {formatDateTime(inviteCode.createdAt)}</p>
                {inviteCode.expiresAt ? <p>截止 {formatDateTime(inviteCode.expiresAt)}</p> : null}
              </div>
              <div className="flex items-center justify-end">
                {inviteCode.status === "active" ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => revokeInviteCode(inviteCode.id)}
                  >
                    <ShieldBan className="h-4 w-4" />
                    作废
                  </Button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
