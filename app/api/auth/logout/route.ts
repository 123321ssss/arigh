import { NextResponse } from "next/server";

import { DEMO_SESSION_COOKIE } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/auth/supabase-server";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  if (supabase) {
    await supabase.auth.signOut();
  }

  const response = NextResponse.redirect(new URL("/login", request.url));
  response.cookies.set(DEMO_SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}
