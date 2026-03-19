import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/session";
import { appRepository } from "@/lib/data/repository";

export async function POST(request: Request) {
  const admin = await requireAdmin();
  const body = (await request.json()) as { email?: string; role?: "admin" | "member" };

  if (!body.email || !body.role) {
    return NextResponse.json({ error: "Invalid invite payload." }, { status: 400 });
  }

  const invite = await appRepository.createInvite(body.email, body.role, admin.id);
  await appRepository.addAuditLog(
    admin.id,
    "member.invite",
    `邀请 ${body.email} 作为 ${body.role} 加入工作区。`,
  );

  return NextResponse.json(invite);
}
