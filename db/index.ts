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

  return new Pool({ connectionString })
}

/** Shared pg pool — pass this to Corsair `createCorsair({ database: pool })`. */
export const pool = globalThis.__pulsePgPool ?? createPool()

if (process.env.NODE_ENV !== "production") {
  globalThis.__pulsePgPool = pool
}

export const db = drizzle(pool, { schema })

export type Database = typeof db
