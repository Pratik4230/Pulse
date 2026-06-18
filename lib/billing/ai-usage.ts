import type { UIMessage } from "ai"
import { and, eq } from "drizzle-orm"

import { db } from "@/db"
import { aiDailyUsage } from "@/db/schema/billing"
import { user } from "@/db/schema/auth/user"
import {
  FREE_DAILY_AI_MESSAGE_LIMIT,
  isProPlan,
  type Plan,
} from "@/lib/billing/plans"

export const AI_DAILY_LIMIT_ERROR_CODE = "AI_DAILY_LIMIT"

export type AiUsageSnapshot = {
  used: number
  limit: number
  remaining: number
  isUnlimited: boolean
  usageDate: string
  timezone: string
}

export function getUsageDateKey(timezone: string, date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date)
}

export function countNewUserTurns(
  messages: UIMessage[],
  savedMessageCount: number,
) {
  if (messages.length <= savedMessageCount) {
    return 0
  }

  return messages
    .slice(savedMessageCount)
    .filter((message) => message.role === "user").length
}

export async function getUserPlan(userId: string): Promise<Plan> {
  const [row] = await db
    .select({ plan: user.plan })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1)

  return isProPlan(row?.plan) ? "pro" : "free"
}

async function readDailyUsage(userId: string, usageDate: string) {
  const [row] = await db
    .select({ messageCount: aiDailyUsage.messageCount })
    .from(aiDailyUsage)
    .where(
      and(
        eq(aiDailyUsage.userId, userId),
        eq(aiDailyUsage.usageDate, usageDate),
      ),
    )
    .limit(1)

  return row?.messageCount ?? 0
}

export async function getDailyAiUsage(
  userId: string,
  timezone: string,
  plan: string | null | undefined,
): Promise<AiUsageSnapshot> {
  const usageDate = getUsageDateKey(timezone)
  const isUnlimited = isProPlan(plan)

  if (isUnlimited) {
    return {
      used: 0,
      limit: FREE_DAILY_AI_MESSAGE_LIMIT,
      remaining: Number.POSITIVE_INFINITY,
      isUnlimited: true,
      usageDate,
      timezone,
    }
  }

  const used = await readDailyUsage(userId, usageDate)
  const limit = FREE_DAILY_AI_MESSAGE_LIMIT

  return {
    used,
    limit,
    remaining: Math.max(0, limit - used),
    isUnlimited: false,
    usageDate,
    timezone,
  }
}

export type ReserveDailyAiMessageResult =
  | ({ ok: true } & AiUsageSnapshot)
  | ({ ok: false } & AiUsageSnapshot)

export async function reserveDailyAiMessages(
  userId: string,
  timezone: string,
  plan: string | null | undefined,
  turns: number,
): Promise<ReserveDailyAiMessageResult> {
  if (turns <= 0) {
    const usage = await getDailyAiUsage(userId, timezone, plan)
    return { ok: true, ...usage }
  }

  if (isProPlan(plan)) {
    const usage = await getDailyAiUsage(userId, timezone, plan)
    return { ok: true, ...usage }
  }

  const usageDate = getUsageDateKey(timezone)
  const limit = FREE_DAILY_AI_MESSAGE_LIMIT

  return db.transaction(async (tx) => {
    const [row] = await tx
      .select({ messageCount: aiDailyUsage.messageCount })
      .from(aiDailyUsage)
      .where(
        and(
          eq(aiDailyUsage.userId, userId),
          eq(aiDailyUsage.usageDate, usageDate),
        ),
      )
      .for("update")

    const used = row?.messageCount ?? 0

    if (used + turns > limit) {
      return {
        ok: false as const,
        used,
        limit,
        remaining: Math.max(0, limit - used),
        isUnlimited: false,
        usageDate,
        timezone,
      }
    }

    const nextCount = used + turns

    if (row) {
      await tx
        .update(aiDailyUsage)
        .set({ messageCount: nextCount, updatedAt: new Date() })
        .where(
          and(
            eq(aiDailyUsage.userId, userId),
            eq(aiDailyUsage.usageDate, usageDate),
          ),
        )
    } else {
      await tx.insert(aiDailyUsage).values({
        userId,
        usageDate,
        messageCount: nextCount,
      })
    }

    return {
      ok: true as const,
      used: nextCount,
      limit,
      remaining: Math.max(0, limit - nextCount),
      isUnlimited: false,
      usageDate,
      timezone,
    }
  })
}
