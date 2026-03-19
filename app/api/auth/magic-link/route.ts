import { NextResponse } from "next/server";

import { env, isSupabaseConfigured } from "@/lib/env";

export const runtime = "nodejs";

function describeUnknownError(error: unknown) {
  if (!(error instanceof Error)) {
    return "Unknown fetch error";
  }

  const parts = [`${error.name}: ${error.message}`];
  const cause = (error as Error & { cause?: unknown }).cause;

  if (cause && typeof cause === "object") {
    const maybeCause = cause as {
      code?: unknown;
      message?: unknown;
      errno?: unknown;
      syscall?: unknown;
      address?: unknown;
      port?: unknown;
    };

    const detail = [
      maybeCause.code ? `code=${String(maybeCause.code)}` : null,
      maybeCause.errno ? `errno=${String(maybeCause.errno)}` : null,
      maybeCause.syscall ? `syscall=${String(maybeCause.syscall)}` : null,
      maybeCause.address ? `address=${String(maybeCause.address)}` : null,
      maybeCause.port ? `port=${String(maybeCause.port)}` : null,
      maybeCause.message ? `message=${String(maybeCause.message)}` : null,
    ]
      .filter(Boolean)
      .join(", ");

    if (detail) {
      parts.push(detail);
    }
  }

  return parts.join(" | ");
}

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
      signal: AbortSignal.timeout(15000),
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
    const detail = describeUnknownError(error);

    return NextResponse.json(
      {
        error: `Supabase request failed. ${detail}`,
        endpointHost: new URL(endpoint).host,
      },
      { status: 502 },
    );
  }
}
