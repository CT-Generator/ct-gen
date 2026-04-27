// Drizzle client. One pool per process.

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { env } from "@/lib/env";

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function db() {
  if (_db) return _db;
  const conn = postgres(env().DATABASE_URL, { prepare: false });
  _db = drizzle(conn, { schema });
  return _db;
}

export { schema };
