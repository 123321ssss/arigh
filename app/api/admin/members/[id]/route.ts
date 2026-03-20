import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/session";
import { createSupabaseAdminClient } from "@/lib/auth/supabase-admin";
import { appRepository } from "@/lib/data/repository";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin();
  const { id } = await context.params;
  const body = (await request.json()) as Record<string, unknown>;
  const member = await appRepository.updateMember(id, {
    ...(body.role ? { role: body.role as "admin" | "member" } : {}),
    ...(typeof body.active === "boolean" ? { active: body.active } : {}),
  });

  if (!member) {
    return NextResponse.json({ error: "Member not found." }, { status: 404 });
  }

  const supabaseAdmin = createSupabaseAdminClient();
  if (supabaseAdmin) {
    await supabaseAdmin.auth.admin.updateUserById(member.id, {
      app_metadata: {
        app_role: member.role,
        active: member.active,
      },
    });
  }

  await appRepository.addAuditLog(
    admin.id,
    "member.update",
    `更新成员 ${member.email} 的角色或状态。`,
  );

  return NextResponse.json(member);
}
