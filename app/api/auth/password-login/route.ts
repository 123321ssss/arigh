import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/auth/supabase-server";
import { appRepository } from "@/lib/data/repository";

export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string; password?: string };
  const email = body.email?.trim().toLowerCase();
  const password = body.password ?? "";

  if (!email || !password) {
    return NextResponse.json({ error: "请完整输入邮箱和密码。" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase 未配置完成。" }, { status: 500 });
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user?.email) {
    return NextResponse.json({ error: error?.message ?? "登录失败。" }, { status: 401 });
  }

  const profile = await appRepository.ensureSupabaseUser({
    id: data.user.id,
    email: data.user.email,
    appMetadata: data.user.app_metadata,
    userMetadata: data.user.user_metadata,
    lastSignInAt: data.user.last_sign_in_at,
  });

  if (!profile) {
    await supabase.auth.signOut();
    return NextResponse.json({ error: "该账号尚未被允许进入工作台。" }, { status: 403 });
  }

  if (!profile.active) {
    await supabase.auth.signOut();
    return NextResponse.json({ error: "该账号已被停用。" }, { status: 403 });
  }

  await appRepository.addAuditLog(profile.id, "auth.login", `账号 ${profile.email} 登录了工作台。`);

  return NextResponse.json({
    ok: true,
    redirectTo: profile.role === "admin" ? "/admin" : "/app",
  });
}
