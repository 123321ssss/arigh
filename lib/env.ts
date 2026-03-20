function normalizeString(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function normalizeUrl(
  value: string | undefined,
  options?: { defaultProtocol?: "https" | "http" },
) {
  const normalized = normalizeString(value);
  if (!normalized) {
    return undefined;
  }

  try {
    return new URL(normalized).toString().replace(/\/$/, "");
  } catch {
    const defaultProtocol = options?.defaultProtocol;
    if (!defaultProtocol) {
      return undefined;
    }

    try {
      return new URL(`${defaultProtocol}://${normalized}`).toString().replace(/\/$/, "");
    } catch {
      return undefined;
    }
  }
}

function resolveAppUrl() {
  const explicitAppUrl = normalizeUrl(process.env.APP_URL, { defaultProtocol: "https" });
  if (explicitAppUrl) {
    return explicitAppUrl;
  }

  const vercelUrl = normalizeUrl(process.env.VERCEL_URL, { defaultProtocol: "https" });
  if (vercelUrl) {
    return vercelUrl;
  }

  return "http://localhost:3000";
}

export const env = {
  APP_NAME: normalizeString(process.env.APP_NAME) ?? "Editorial AI Console",
  APP_URL: resolveAppUrl(),
  APP_DEMO_MODE: normalizeString(process.env.APP_DEMO_MODE) !== "false",
  APP_BOOTSTRAP_SECRET: normalizeString(process.env.APP_BOOTSTRAP_SECRET),
  APP_ENCRYPTION_SECRET:
    normalizeString(process.env.APP_ENCRYPTION_SECRET) ?? "editorial-ai-console-dev-secret",
  AI_BASE_URL: normalizeUrl(process.env.AI_BASE_URL, { defaultProtocol: "https" }),
  AI_API_KEY: normalizeString(process.env.AI_API_KEY),
  AI_PROVIDER_NAME: normalizeString(process.env.AI_PROVIDER_NAME) ?? "openai-compatible",
  AI_DEFAULT_MODEL: normalizeString(process.env.AI_DEFAULT_MODEL) ?? "gpt-4.1-mini",
  NEXT_PUBLIC_SUPABASE_URL: normalizeUrl(process.env.NEXT_PUBLIC_SUPABASE_URL, {
    defaultProtocol: "https",
  }),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: normalizeString(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  SUPABASE_SERVICE_ROLE_KEY: normalizeString(process.env.SUPABASE_SERVICE_ROLE_KEY),
  DATABASE_URL: normalizeString(process.env.DATABASE_URL),
  SMTP_FROM: normalizeString(process.env.SMTP_FROM),
};

export function isAiConfigured() {
  return Boolean(env.AI_BASE_URL && env.AI_API_KEY);
}

export function isSupabaseConfigured() {
  return Boolean(
    env.NEXT_PUBLIC_SUPABASE_URL &&
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

export function isDatabaseConfigured() {
  return Boolean(env.DATABASE_URL);
}
