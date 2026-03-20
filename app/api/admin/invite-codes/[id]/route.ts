import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/session";
import { appRepository } from "@/lib/data/repository";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin();
  const { id } = await context.params;
  const body = (await request.json()) as { status?: "revoked" };

  if (body.status !== "revoked") {
    return NextResponse.json({ error: "当前仅支持作废邀请码。" }, { status: 400 });
  }

  const inviteCode = await appRepository.revokeInviteCode(id);
  if (!inviteCode) {
    return NextResponse.json({ error: "邀请码不存在。" }, { status: 404 });
  }

  await appRepository.addAuditLog(
    admin.id,
    "invite-code.revoke",
    `作废了邀请码 ${inviteCode.codePreview}。`,
  );

  return NextResponse.json({
    ok: true,
    inviteCode,
  });
}
