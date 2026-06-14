import { eq } from "drizzle-orm"

import { db } from "@/db"
import { user } from "@/db/schema/auth/user"
import { resolveUserLocale, type UserLocale } from "@/lib/locale"

export async function getUserLocale(userId: string): Promise<UserLocale> {
  const rows = await db
    .select({
      country: user.country,
      currency: user.currency,
      timezone: user.timezone,
    })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1)

  return resolveUserLocale(rows[0] ?? {})
}
