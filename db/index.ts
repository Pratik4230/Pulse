import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"

import * as schema from "./schema"

declare global {
  var __pulsePgPool: Pool | undefined
}

function createPool() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set")
  }

  return new Pool({ connectionString: normalizeDatabaseUrl(connectionString) })
}

/** Avoid pg-connection-string v3 SSL deprecation warning (Neon uses sslmode=require). */
function normalizeDatabaseUrl(connectionString: string) {
  try {
    const url = new URL(connectionString)
    const sslmode = url.searchParams.get("sslmode")

    if (
      sslmode === "require" ||
      sslmode === "prefer" ||
      sslmode === "verify-ca"
    ) {
      url.searchParams.set("sslmode", "verify-full")
    }

    return url.toString()
  } catch {
    return connectionString
  }
}

/** Shared pg pool — pass this to Corsair `createCorsair({ database: pool })`. */
export const pool = globalThis.__pulsePgPool ?? createPool()

if (process.env.NODE_ENV !== "production") {
  globalThis.__pulsePgPool = pool
}

export const db = drizzle(pool, { schema })

export type Database = typeof db
