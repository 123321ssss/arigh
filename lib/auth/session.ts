import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { env, isSupabaseConfigured } from "@/lib/env";
import { appRepository } from "@/lib/data/repository";
import { createSupabaseServerClient } from "@/lib/auth/supabase-server";

export const DEMO_SESSION_COOKIE = "editorial_ai_demo_session";

export function getAuthMode() {
  if (env.APP_DEMO_MODE || !isSupabaseConfigured()) {
    return "demo" as const;
  }

  return "supabase" as const;
}

function getDemoUserId(value: string | undefined) {
  if (value === "admin") {
    return "user-admin-1";
  }

  if (value === "member") {
    return "user-member-1";
  }

  return value;
}

export async function getCurrentUser() {
  if (getAuthMode() === "demo") {
    const cookieStore = await cookies();
    const demoUserId = getDemoUserId(cookieStore.get(DEMO_SESSION_COOKIE)?.value);
    const userId = demoUserId ?? "user-member-1";

    return appRepository.getUserById(userId);
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return null;
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return null;
  }

  return appRepository.ensureSupabaseUser({
    id: user.id,
    email: user.email,
    appMetadata: user.app_metadata,
    userMetadata: user.user_metadata,
    lastSignInAt: user.last_sign_in_at,
  });
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user || !user.active) {
    redirect("/login");
  }

  return user;
}

export async function requireAdmin() {
  const user = await requireUser();

  if (user.role !== "admin") {
    redirect("/app");
  }

  return user;
}

export function resolveDemoLoginTarget(role: "admin" | "member") {
  return role === "admin" ? "user-admin-1" : "user-member-1";
}
