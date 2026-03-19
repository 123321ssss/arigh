import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { env, isDatabaseConfigured } from "@/lib/env";

let client: ReturnType<typeof postgres> | null = null;

export function getDb() {
  if (!isDatabaseConfigured()) {
    return null;
  }

  if (!client) {
    client = postgres(env.DATABASE_URL!, {
      prepare: false,
    });
  }

  return drizzle(client);
}
