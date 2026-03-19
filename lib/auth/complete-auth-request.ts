import { createServerClient } from "@supabase/ssr";
import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { env, isSupabaseConfigured } from "@/lib/env";

const VALID_EMAIL_OTP_TYPES = new Set<EmailOtpType>([
  "email",
  "magiclink",
  "recovery",
  "invite",
  "email_change",
  "signup",
]);

function normalizeNextPath(request: Request, value: string | null) {
  if (!value) {
    return "/app";
  }

  try {
    const candidate = new URL(value, request.url);
    if (candidate.origin === new URL(request.url).origin) {
      return `${candidate.pathname}${candidate.search}`;
    }
  } catch {
    if (value.startsWith("/")) {
      return value;
    }
  }

  return "/app";
}

function readRequestCookies(request: Request) {
  const rawCookie = request.headers.get("cookie");
  if (!rawCookie) {
    return [];
  }

  return rawCookie.split(";").map((item) => {
    const [name, ...rest] = item.trim().split("=");
    return { name, value: rest.join("=") };
  });
}

function getOtpType(type: string | null) {
  if (type && VALID_EMAIL_OTP_TYPES.has(type as EmailOtpType)) {
    return type as EmailOtpType;
  }

  return "email" as const;
}

export async function completeAuthRequest(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const url = new URL(request.url);
  const safeNext = normalizeNextPath(
    request,
    url.searchParams.get("next") ?? url.searchParams.get("redirect_to"),
  );
  const response = NextResponse.redirect(new URL(safeNext, request.url));
  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL!,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return readRequestCookies(request);
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = getOtpType(url.searchParams.get("type"));

  try {
    if (code) {
      await supabase.auth.exchangeCodeForSession(code);
      return response;
    }

    if (tokenHash) {
      await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type,
      });
      return response;
    }
  } catch {
    return NextResponse.redirect(
      new URL("/login?error=auth_callback_failed", request.url),
    );
  }

  return NextResponse.redirect(
    new URL("/login?error=auth_callback_missing_token", request.url),
  );
}
