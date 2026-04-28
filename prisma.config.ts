import { defineConfig } from "prisma/config";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

// Prisma 7 config files are loaded before Next has read `.env`, so migrations
// need a small explicit reader to use the same DATABASE_URL as the app.
function readDatabaseUrlFromEnvFile() {
  const envPath = join(process.cwd(), ".env");

  if (!existsSync(envPath)) {
    return undefined;
  }

  const match = readFileSync(envPath, "utf8").match(/^DATABASE_URL=(.+)$/m);

  return match?.[1]?.trim().replace(/^["']|["']$/g, "");
}

const databaseUrl =
  process.env.DATABASE_URL ??
  readDatabaseUrlFromEnvFile() ??
  // Local fallback keeps `prisma generate` usable before a project `.env` exists.
  "postgresql://postgres:postgres@localhost:5432/reprun?schema=public";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: databaseUrl,
  },
});
