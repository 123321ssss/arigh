import { NextResponse } from "next/server";

import { env, isSupabaseConfigured } from "@/lib/env";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase 未完成配置，请检查环境变量。" },
      { status: 500 },
    );
  }

  const body = (await request.json().catch(() => null)) as { email?: string } | null;
  const email = body?.email?.trim();

  if (!email) {
    return NextResponse.json({ error: "请提供邮箱地址。" }, { status: 400 });
  }

  const endpoint = `${env.NEXT_PUBLIC_SUPABASE_URL!}/auth/v1/otp?redirect_to=${encodeURIComponent(
    env.APP_URL,
  )}`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        apikey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        data: {},
        create_user: true,
        gotrue_meta_security: {},
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json(
        {
          error: text || `Supabase OTP request failed with status ${response.status}.`,
        },
        { status: response.status },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const detail =
      error instanceof Error
        ? `${error.name}: ${error.message}`
        : "Unknown fetch error";

    return NextResponse.json(
      { error: `Supabase request failed. ${detail}` },
      { status: 502 },
    );
  }
}
