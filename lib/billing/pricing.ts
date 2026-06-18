import { formatMoney } from "@/lib/currencies"

export const PRO_DISPLAY_CURRENCY = "USD" as const

export type ProPriceDisplay = {
  currency: string
  monthlyMinor: number
  formatted: string
  periodLabel: string
}

/** Default $80/mo — override with PRO_PRICE_USD env (minor units, e.g. 8000). */
const DEFAULT_PRO_PRICE_USD_MINOR = 8_000

function readProPriceUsdMinor() {
  const raw = process.env.PRO_PRICE_USD?.trim()
  if (!raw) return undefined
  const parsed = Number.parseInt(raw, 10)
  return Number.isFinite(parsed) ? parsed : undefined
}

export function getFreeDisplayPrice() {
  return formatMoney(0, PRO_DISPLAY_CURRENCY)
}

/** Pro plan price for all UI — always shown in USD. */
export function getProDisplayPrice(): ProPriceDisplay {
  const monthlyMinor =
    readProPriceUsdMinor() ?? DEFAULT_PRO_PRICE_USD_MINOR

  return {
    currency: PRO_DISPLAY_CURRENCY,
    monthlyMinor,
    formatted: formatMoney(monthlyMinor, PRO_DISPLAY_CURRENCY),
    periodLabel: "per month",
  }
}

export const FREE_PLAN_FEATURES = [
  "Full inbox & calendar workspace",
  "Real-time Gmail & Calendar sync",
  "7 Pulse AI messages per day (text + voice)",
] as const

export const PRO_PLAN_FEATURES = [
  "Everything in Free",
  "Unlimited Pulse AI messages",
  "Voice input in 9 languages",
  "Priority access to new AI features",
] as const
