import { z } from "zod";

const envSchema = z.object({
  APP_NAME: z.string().default("Editorial AI Console"),
  APP_URL: z.string().url().default("http://localhost:3000"),
  APP_DEMO_MODE: z
    .string()
    .optional()
    .transform((value) => value !== "false"),
  APP_ENCRYPTION_SECRET: z.string().default("editorial-ai-console-dev-secret"),
  AI_BASE_URL: z.string().url().optional(),
  AI_API_KEY: z.string().optional(),
  AI_PROVIDER_NAME: z.string().default("openai-compatible"),
  AI_DEFAULT_MODEL: z.string().default("gpt-4.1-mini"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  DATABASE_URL: z.string().optional(),
  SMTP_FROM: z.string().optional(),
});

export const env = envSchema.parse({
  APP_NAME: process.env.APP_NAME,
  APP_URL: process.env.APP_URL,
  APP_DEMO_MODE: process.env.APP_DEMO_MODE,
  APP_ENCRYPTION_SECRET: process.env.APP_ENCRYPTION_SECRET,
  AI_BASE_URL: process.env.AI_BASE_URL,
  AI_API_KEY: process.env.AI_API_KEY,
  AI_PROVIDER_NAME: process.env.AI_PROVIDER_NAME,
  AI_DEFAULT_MODEL: process.env.AI_DEFAULT_MODEL,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  DATABASE_URL: process.env.DATABASE_URL,
  SMTP_FROM: process.env.SMTP_FROM,
});

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
