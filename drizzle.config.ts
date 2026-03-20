import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { defineConfig } from "drizzle-kit";

function readDatabaseUrl() {
  if (process.env.DATABASE_URL?.trim()) {
    return process.env.DATABASE_URL.trim();
  }

  const candidates = [".env.local", ".env"];

  for (const candidate of candidates) {
    const filePath = join(process.cwd(), candidate);
    if (!existsSync(filePath)) {
      continue;
    }

    const content = readFileSync(filePath, "utf8");
    const line = content
      .split(/\r?\n/)
      .find((entry) => entry.startsWith("DATABASE_URL="));

    if (!line) {
      continue;
    }

    const value = line.slice("DATABASE_URL=".length).trim();
    if (value) {
      return value.replace(/^['"]|['"]$/g, "");
    }
  }

  return "";
}

export default defineConfig({
  schema: "./lib/data/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: readDatabaseUrl(),
  },
  strict: true,
});
