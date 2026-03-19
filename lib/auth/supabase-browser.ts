"use client";

import { createBrowserClient } from "@supabase/ssr";

function normalizeBrowserUrl(value: string | undefined) {
  const normalized = value?.trim();
  if (!normalized) {
    return null;
  }

  try {
    return new URL(normalized).toString().replace(/\/$/, "");
  } catch {
    try {
      return new URL(`https://${normalized}`).toString().replace(/\/$/, "");
    } catch {
      return null;
    }
  }
}

export function createSupabaseBrowserClient() {
  const url = normalizeBrowserUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !anonKey) {
    return null;
  }

  return createBrowserClient(url, anonKey);
}
