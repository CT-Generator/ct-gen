// Centralized env access. Read once, validate, freeze.
//
// Supports the Docker secrets pattern: any required env var FOO can also be
// set as FOO_FILE=/path/to/file, in which case the file's trimmed contents
// become the value. This lets dev use plain .env.local and production mount
// /run/secrets/* without the app code knowing the difference.

import { readFileSync } from "node:fs";
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  // Database
  DATABASE_URL: z.string().url().describe("Postgres connection string, e.g. postgres://app:pw@db:5432/cgen"),

  // OpenAI — primary generation + moderation
  OPENAI_API_KEY: z.string().min(20),
  OPENAI_MODEL: z.string().default("gpt-5-mini"),
  OPENAI_MODEL_FALLBACK: z.string().default("gpt-5-mini"),
  OPENAI_MODERATION_MODEL: z.string().default("omni-moderation-latest"),

  // Identity
  SESSION_HASH_SALT: z.string().min(16).describe("Server-side salt for the anonymous session hash"),

  // Public domain — used for OG card absolute URLs and share intents
  PUBLIC_BASE_URL: z.string().url().default("https://conspiracy-generator.duckdns.org"),

  // Maintainer-only stats page (Basic Auth)
  STATS_PASSWORD: z.string().min(8).describe("Password for /stats Basic Auth"),

  // Visitor analytics — opt-in country resolution. Reads ISO-2 country code
  // from this request header (e.g. set by Cloudflare's CF-IPCountry, or by a
  // future Caddy maxmind module). Absent header → country stored as NULL.
  GEOIP_COUNTRY_HEADER: z.string().default("cf-ipcountry"),
});

export type Env = z.infer<typeof schema>;

const SECRET_KEYS = [
  "OPENAI_API_KEY",
  "SESSION_HASH_SALT",
  "STATS_PASSWORD",
  "DATABASE_URL",
] as const;

/**
 * For each `<KEY>_FILE` env var, read the file and copy its trimmed contents into `<KEY>`,
 * unless `<KEY>` is already set.
 */
function resolveFileEnvVars(): NodeJS.ProcessEnv {
  const out = { ...process.env };
  for (const k of SECRET_KEYS) {
    const fileVar = process.env[`${k}_FILE`];
    if (fileVar && !out[k]) {
      try {
        out[k] = readFileSync(fileVar, "utf8").trim();
      } catch (err) {
        console.error(`[env] failed to read ${k}_FILE=${fileVar}:`, err);
      }
    }
  }
  return out;
}

let cached: Env | null = null;

export function env(): Env {
  if (cached) return cached;
  const resolved = resolveFileEnvVars();
  const parsed = schema.safeParse(resolved);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }
  cached = parsed.data;
  return cached;
}
