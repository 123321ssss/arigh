import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/session";
import { appRepository } from "@/lib/data/repository";

export async function POST(request: Request) {
  const admin = await requireAdmin();
  const body = (await request.json()) as {
    role?: "admin" | "member";
    maxUses?: number;
    expiresAt?: string | null;
    note?: string | null;
    allowedEmailDomain?: string | null;
  };

  if (!body.role) {
    return NextResponse.json({ error: "角色不能为空。" }, { status: 400 });
  }

  const inviteCode = await appRepository.createInviteCode({
    role: body.role,
    createdBy: admin.id,
    maxUses: body.maxUses,
    expiresAt: body.expiresAt ?? null,
    note: body.note ?? null,
    allowedEmailDomain: body.allowedEmailDomain ?? null,
  });
  const registerUrl = new URL("/register", request.url);
  if (inviteCode.code) {
    registerUrl.searchParams.set("invite", inviteCode.code);
  }

  await appRepository.addAuditLog(
    admin.id,
    "invite-code.create",
    `创建了 ${inviteCode.role} 邀请码 ${inviteCode.codePreview}。`,
  );

  return NextResponse.json({
    ok: true,
    inviteCode,
    registerUrl: registerUrl.toString(),
  });
}
