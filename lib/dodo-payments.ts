import DodoPayments from "dodopayments"

import { DODO_PRO_PRODUCT_SLUG } from "@/lib/billing/dodo-config"

export function isDodoPaymentsConfigured() {
  return Boolean(process.env.DODO_PAYMENTS_API_KEY?.trim())
}

export function getDodoEnvironment(): "test_mode" | "live_mode" {
  return process.env.DODO_PAYMENTS_ENVIRONMENT === "live_mode"
    ? "live_mode"
    : "test_mode"
}

let cachedClient: DodoPayments | null | undefined

export function getDodoPaymentsClient(): DodoPayments | null {
  if (cachedClient !== undefined) {
    return cachedClient
  }

  const apiKey = process.env.DODO_PAYMENTS_API_KEY?.trim()
  if (!apiKey) {
    cachedClient = null
    return null
  }

  cachedClient = new DodoPayments({
    bearerToken: apiKey,
    environment: getDodoEnvironment(),
  })
  return cachedClient
}

export function getDodoProducts() {
  const productId = process.env.DODO_PRO_PRODUCT_ID?.trim()
  if (!productId) {
    return []
  }

  return [{ productId, slug: DODO_PRO_PRODUCT_SLUG }]
}

export function getDodoCheckoutSuccessUrl() {
  const base =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.BETTER_AUTH_URL ??
    "http://localhost:3000"

  return `${base.replace(/\/$/, "")}/settings/billing?checkout=success`
}
