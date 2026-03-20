import { NextResponse } from "next/server";

import { canAccessSetup } from "@/lib/auth/bootstrap";
import { createSupabaseAdminClient } from "@/lib/auth/supabase-admin";
import { createSupabaseServerClient } from "@/lib/auth/supabase-server";
import { appRepository } from "@/lib/data/repository";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    email?: string;
    password?: string;
    displayName?: string;
    token?: string | null;
  };

  const allowed = await canAccessSetup(body.token);
  if (!allowed) {
    return NextResponse.json({ error: "初始化入口已关闭。" }, { status: 403 });
  }

  const email = body.email?.trim().toLowerCase();
  const displayName = body.displayName?.trim();
  const password = body.password ?? "";

  if (!email || !displayName || !password) {
    return NextResponse.json({ error: "请完整填写管理员信息。" }, { status: 400 });
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
      app_role: "admin",
      active: true,
      bootstrap: true,
    },
  });

  if (error || !data.user?.email) {
    return NextResponse.json({ error: error?.message ?? "管理员创建失败。" }, { status: 400 });
  }

  const signInResult = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (signInResult.error || !signInResult.data.user?.email) {
    return NextResponse.json(
      { error: signInResult.error?.message ?? "管理员创建成功，但自动登录失败。" },
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
    return NextResponse.json({ error: "管理员创建成功，但资料建档失败。" }, { status: 500 });
  }

  await appRepository.addAuditLog(
    profile.id,
    "auth.bootstrap",
    `管理员 ${profile.email} 完成首次初始化。`,
  );

  return NextResponse.json({
    ok: true,
    redirectTo: "/admin",
  });
}
