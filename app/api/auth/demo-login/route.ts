import { NextResponse } from "next/server";

import { DEMO_SESSION_COOKIE, resolveDemoLoginTarget } from "@/lib/auth/session";

export async function POST(request: Request) {
  const body = (await request.json()) as { role?: "admin" | "member" };
  const role = body.role === "admin" ? "admin" : "member";
  const userId = resolveDemoLoginTarget(role);

  const response = NextResponse.json({ ok: true, role, userId });
  response.cookies.set(DEMO_SESSION_COOKIE, userId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  return response;
}
