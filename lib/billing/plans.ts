export const PLANS = ["free", "pro"] as const

export type Plan = (typeof PLANS)[number]

export const DEFAULT_PLAN: Plan = "free"

export const FREE_DAILY_AI_MESSAGE_LIMIT = 7

export function isProPlan(plan: string | null | undefined): plan is "pro" {
  return plan === "pro"
}

export function isFreePlan(plan: string | null | undefined): plan is "free" {
  return !plan || plan === "free"
}

export function getPlanLabel(plan: string | null | undefined) {
  return isProPlan(plan) ? "Pro" : "Free"
}
