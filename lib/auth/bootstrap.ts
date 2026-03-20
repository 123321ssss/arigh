import { env } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/auth/supabase-admin";

function hasBootstrapSecretMatch(token?: string | null) {
  const expected = env.APP_BOOTSTRAP_SECRET?.trim();
  return Boolean(expected && token && token === expected);
}

export async function hasAdminAccounts() {
  const supabaseAdmin = createSupabaseAdminClient();
  if (!supabaseAdmin) {
    return false;
  }

  const { data, error } = await supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });

  if (error) {
    return false;
  }

  return data.users.some((user) => {
    const role = user.app_metadata?.app_role ?? user.user_metadata?.app_role;
    return role === "admin";
  });
}

export async function canAccessSetup(token?: string | null) {
  if (hasBootstrapSecretMatch(token)) {
    return true;
  }

  return !(await hasAdminAccounts());
}
