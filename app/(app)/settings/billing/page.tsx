import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { Suspense } from "react"

import { AppShell } from "@/features/pulse/components/app-shell"
import { BillingSettings } from "@/features/settings/components/billing-settings"
import { auth } from "@/lib/auth"
import { getFreeDisplayPrice, getProDisplayPrice } from "@/lib/billing/pricing"
import { isProPlan } from "@/lib/billing/plans"
import { syncPlanFromActiveSubscription } from "@/lib/billing/sync-plan-from-checkout"
import { isDodoPaymentsConfigured } from "@/lib/dodo-payments"

type BillingPageProps = {
  searchParams: Promise<{
    checkout?: string
    subscription_id?: string
    status?: string
  }>
}

export default async function SettingsBillingPage({
  searchParams,
}: BillingPageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/login")
  }

  const params = await searchParams
  if (
    params.checkout === "success" &&
    params.status === "active" &&
    params.subscription_id
  ) {
    await syncPlanFromActiveSubscription(
      session.user.id,
      session.user.email,
      params.subscription_id,
    )
  }

  const refreshedSession = await auth.api.getSession({
    headers: await headers(),
  })

  const plan =
    typeof refreshedSession?.user.plan === "string"
      ? refreshedSession.user.plan
      : "free"

  const proPrice = getProDisplayPrice()
  const freePriceFormatted = getFreeDisplayPrice()

  return (
    <AppShell title="Billing">
      <div className="mx-auto w-full max-w-3xl p-6">
        <Suspense fallback={null}>
          <BillingSettings
            plan={isProPlan(plan) ? "pro" : "free"}
            dodoConfigured={isDodoPaymentsConfigured()}
            proPrice={proPrice}
            freePriceFormatted={freePriceFormatted}
          />
        </Suspense>
      </div>
    </AppShell>
  )
}
