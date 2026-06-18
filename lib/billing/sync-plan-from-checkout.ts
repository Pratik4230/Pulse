import { eq } from "drizzle-orm"

import { db } from "@/db"
import { user } from "@/db/schema/auth/user"
import { setUserPlan } from "@/lib/billing/sync-user-plan"
import { getDodoPaymentsClient } from "@/lib/dodo-payments"

export async function syncPlanFromActiveSubscription(
  userId: string,
  userEmail: string,
  subscriptionId: string,
) {
  const client = getDodoPaymentsClient()
  if (!client) {
    return false
  }

  const subscription = await client.subscriptions.retrieve(subscriptionId)
  if (subscription.status !== "active") {
    return false
  }

  const customerEmail = subscription.customer?.email?.toLowerCase()
  if (!customerEmail || customerEmail !== userEmail.toLowerCase()) {
    return false
  }

  const customerId = subscription.customer?.customer_id
  if (customerId) {
    await db
      .update(user)
      .set({ dodoCustomerId: customerId, updatedAt: new Date() })
      .where(eq(user.id, userId))

    await client.customers.update(customerId, {
      metadata: {
        ...(subscription.customer?.metadata ?? {}),
        userId,
      },
    })
  }

  await setUserPlan(userId, "pro")
  return true
}
