// Centralized env access. Read once, validate, freeze.
// Throws at boot if a required value is missing — no silent undefineds in handlers.

import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  // Database
  DATABASE_URL: z.string().url().describe("Postgres connection string, e.g. postgres://app:pw@db:5432/cgen"),

  // OpenAI — primary generation + moderation
  OPENAI_API_KEY: z.string().min(20),
  OPENAI_MODEL: z.string().default("gpt-5"),
  OPENAI_MODEL_FALLBACK: z.string().default("gpt-5-mini"),
  OPENAI_MODERATION_MODEL: z.string().default("omni-moderation-latest"),

  // Identity
  SESSION_HASH_SALT: z.string().min(16).describe("Server-side salt for the anonymous session hash"),

  // Public domain — used for OG card absolute URLs and share intents
  PUBLIC_BASE_URL: z.string().url().default("https://conspiracy-generator.duckdns.org"),
});

export type Env = z.infer<typeof schema>;

let cached: Env | null = null;

export function env(): Env {
  if (cached) return cached;
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }
  cached = parsed.data;
  return cached;
}
