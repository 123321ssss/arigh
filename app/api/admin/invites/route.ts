import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/session";
import { createSupabaseAdminClient } from "@/lib/auth/supabase-admin";
import { appRepository } from "@/lib/data/repository";
import { env } from "@/lib/env";

export async function POST(request: Request) {
  const admin = await requireAdmin();
  const body = (await request.json()) as { email?: string; role?: "admin" | "member" };
  const email = body.email?.trim().toLowerCase();

  if (!email || !body.role) {
    return NextResponse.json({ error: "Invalid invite payload." }, { status: 400 });
  }

  const supabaseAdmin = createSupabaseAdminClient();
  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: "Supabase admin client is unavailable." },
      { status: 500 },
    );
  }

  const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
    redirectTo: env.APP_URL,
    data: {
      app_role: body.role,
      invited_by: admin.id,
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (data.user?.id) {
    await supabaseAdmin.auth.admin.updateUserById(data.user.id, {
      app_metadata: {
        app_role: body.role,
        active: true,
      },
    });
  }

  const invite = await appRepository.createInvite(email, body.role, admin.id);
  await appRepository.addAuditLog(
    admin.id,
    "member.invite",
    `邀请 ${email} 作为 ${body.role} 加入工作区，并发送 Supabase 邀请邮件。`,
  );

  return NextResponse.json({
    ok: true,
    invite,
    message: `邀请邮件已发送到 ${email}。`,
  });
}
