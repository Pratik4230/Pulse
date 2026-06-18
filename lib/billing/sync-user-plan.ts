import { eq } from "drizzle-orm"

import { db } from "@/db"
import { user } from "@/db/schema/auth/user"
import type { Plan } from "@/lib/billing/plans"

type WebhookCustomer = {
  email?: string
  customer_id?: string
  metadata?: Record<string, unknown>
}

function getWebhookCustomer(payload: unknown): WebhookCustomer | null {
  if (!payload || typeof payload !== "object") {
    return null
  }

  const data = (payload as { data?: unknown }).data
  if (!data || typeof data !== "object") {
    return null
  }

  const customer = (data as { customer?: unknown }).customer
  if (!customer || typeof customer !== "object") {
    return null
  }

  return customer as WebhookCustomer
}

export async function setUserPlan(userId: string, plan: Plan) {
  await db
    .update(user)
    .set({ plan, updatedAt: new Date() })
    .where(eq(user.id, userId))
}

export async function resolveUserIdFromWebhookPayload(payload: unknown) {
  const customer = getWebhookCustomer(payload)
  if (!customer) {
    return null
  }

  const metadataUserId = customer.metadata?.userId
  if (typeof metadataUserId === "string" && metadataUserId.length > 0) {
    const [byMetadataId] = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.id, metadataUserId))
      .limit(1)

    if (byMetadataId) {
      return byMetadataId.id
    }
  }

  if (customer.customer_id) {
    const [byDodoId] = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.dodoCustomerId, customer.customer_id))
      .limit(1)

    if (byDodoId) {
      return byDodoId.id
    }
  }

  if (customer.email) {
    const [byEmail] = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.email, customer.email))
      .limit(1)

    if (byEmail) {
      return byEmail.id
    }
  }

  return null
}

function hasActiveSubscriptionPayment(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return false
  }

  const data = (payload as { data?: unknown }).data
  if (!data || typeof data !== "object") {
    return false
  }

  const subscriptionId = (data as { subscription_id?: unknown }).subscription_id
  return typeof subscriptionId === "string" && subscriptionId.length > 0
}

async function promoteToPro(payload: unknown) {
  const userId = await resolveUserIdFromWebhookPayload(payload)
  if (!userId) {
    return
  }

  const customer = getWebhookCustomer(payload)
  if (customer?.customer_id) {
    await db
      .update(user)
      .set({ dodoCustomerId: customer.customer_id, updatedAt: new Date() })
      .where(eq(user.id, userId))
  }

  await setUserPlan(userId, "pro")
}

async function demoteToFree(payload: unknown) {
  const userId = await resolveUserIdFromWebhookPayload(payload)
  if (!userId) {
    return
  }

  await setUserPlan(userId, "free")
}

export function createDodoWebhookHandlers() {
  return {
    onPaymentSucceeded: async (payload: unknown) => {
      if (hasActiveSubscriptionPayment(payload)) {
        await promoteToPro(payload)
      }
    },
    onSubscriptionActive: promoteToPro,
    onSubscriptionRenewed: promoteToPro,
    onSubscriptionPlanChanged: promoteToPro,
    onSubscriptionCancelled: demoteToFree,
    onSubscriptionExpired: demoteToFree,
    onSubscriptionFailed: demoteToFree,
    onSubscriptionOnHold: demoteToFree,
  }
}
