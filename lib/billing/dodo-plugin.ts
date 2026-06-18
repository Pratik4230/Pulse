import {
  checkout,
  dodopayments,
  portal,
  webhooks,
  type DodoPaymentsPlugins,
} from "@dodopayments/better-auth"
import type { User } from "better-auth"

import { createDodoWebhookHandlers } from "@/lib/billing/sync-user-plan"
import {
  getDodoCheckoutSuccessUrl,
  getDodoPaymentsClient,
  getDodoProducts,
} from "@/lib/dodo-payments"

type AuthUserWithLocale = User & {
  country?: string | null
  currency?: string | null
}

export function createDodoPaymentsAuthPlugin() {
  const client = getDodoPaymentsClient()
  if (!client) {
    return null
  }

  const webhookSecret = process.env.DODO_PAYMENTS_WEBHOOK_SECRET?.trim()

  const use = [
    checkout({
      products: getDodoProducts(),
      successUrl: getDodoCheckoutSuccessUrl(),
      authenticatedUsersOnly: true,
    }),
    portal(),
    ...(webhookSecret
      ? [
          webhooks({
            webhookKey: webhookSecret,
            ...createDodoWebhookHandlers(),
          }),
        ]
      : []),
  ] as DodoPaymentsPlugins

  return dodopayments({
    client,
    createCustomerOnSignUp: true,
    getCustomerParams: (authUser) => {
      const user = authUser as AuthUserWithLocale

      return {
        metadata: {
          userId: user.id,
          ...(user.country ? { country: user.country } : {}),
          ...(user.currency ? { currency: user.currency } : {}),
        },
      }
    },
    use,
  })
}
