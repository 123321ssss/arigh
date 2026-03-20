import { NextResponse } from "next/server";

import { createSupabaseAdminClient } from "@/lib/auth/supabase-admin";
import { createSupabaseServerClient } from "@/lib/auth/supabase-server";
import { appRepository } from "@/lib/data/repository";
import type { RegisterWithInviteInput } from "@/lib/domain/types";

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<RegisterWithInviteInput>;
  const email = body.email?.trim().toLowerCase();
  const displayName = body.displayName?.trim();
  const password = body.password ?? "";
  const code = body.code?.trim() ?? "";

  if (!email || !displayName || !password || !code) {
    return NextResponse.json(
      { error: "请完整填写邀请码、显示名、邮箱和密码。" },
      { status: 400 },
    );
  }

  const inviteValidation = await appRepository.validateInviteCode(code, email);
  if (!inviteValidation.ok) {
    return NextResponse.json({ error: inviteValidation.error }, { status: 400 });
  }

  const supabaseAdmin = createSupabaseAdminClient();
  const supabase = await createSupabaseServerClient();
  if (!supabaseAdmin || !supabase) {
    return NextResponse.json({ error: "Supabase 未配置完成。" }, { status: 500 });
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      display_name: displayName,
    },
    app_metadata: {
      app_role: inviteValidation.inviteCode.role,
      active: true,
      invite_code_id: inviteValidation.inviteCode.id,
      invited_by: inviteValidation.inviteCode.createdBy,
    },
  });

  if (error || !data.user?.email) {
    return NextResponse.json({ error: error?.message ?? "注册失败。" }, { status: 400 });
  }

  await appRepository.markInviteCodeUsed(inviteValidation.inviteCode.id);

  const signInResult = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (signInResult.error || !signInResult.data.user?.email) {
    return NextResponse.json(
      { error: signInResult.error?.message ?? "注册成功，但自动登录失败。" },
      { status: 500 },
    );
  }

  const profile = await appRepository.ensureSupabaseUser({
    id: signInResult.data.user.id,
    email: signInResult.data.user.email,
    appMetadata: signInResult.data.user.app_metadata,
    userMetadata: signInResult.data.user.user_metadata,
    lastSignInAt: signInResult.data.user.last_sign_in_at,
  });

  if (!profile) {
    return NextResponse.json({ error: "注册成功，但资料建档失败。" }, { status: 500 });
  }

  await appRepository.addAuditLog(
    profile.id,
    "auth.register",
    `账号 ${profile.email} 使用邀请码注册，角色为 ${profile.role}。`,
  );

  return NextResponse.json({
    ok: true,
    redirectTo: profile.role === "admin" ? "/admin" : "/app",
  });
}
