"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Check, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useAiUsage } from "@/features/pulse/hooks/use-ai-usage"
import { useBillingActions } from "@/features/billing/hooks/use-billing-actions"
import {
  FREE_PLAN_FEATURES,
  PRO_PLAN_FEATURES,
  type ProPriceDisplay,
} from "@/lib/billing/pricing"
import { getPlanLabel, isProPlan } from "@/lib/billing/plans"
import { cn } from "@/lib/utils"

type BillingSettingsProps = {
  plan: string
  dodoConfigured: boolean
  proPrice: ProPriceDisplay
  freePriceFormatted: string
}

function PlanFeatureList({ items }: { items: readonly string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
          <Check className="mt-0.5 size-4 shrink-0 text-warm-muted" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

export function BillingSettings({
  plan,
  dodoConfigured,
  proPrice,
  freePriceFormatted,
}: BillingSettingsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { checkout, portal } = useBillingActions()
  const { data: aiUsage, refetch: refetchAiUsage } = useAiUsage()

  const isPro = isProPlan(plan)

  useEffect(() => {
    if (searchParams.get("checkout") !== "success") {
      return
    }

    toast.success("Welcome to Pulse Pro! Your plan will update in a moment.")
    void refetchAiUsage()
    router.replace("/settings/billing")
  }, [refetchAiUsage, router, searchParams])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle>Current plan</CardTitle>
            <Badge variant={isPro ? "default" : "secondary"}>
              {getPlanLabel(plan)}
            </Badge>
          </div>
          <CardDescription>
            {isPro
              ? "You have unlimited Pulse AI and voice input."
              : "Inbox and calendar are unlimited. Pulse AI is limited on Free."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isPro && aiUsage && !aiUsage.isUnlimited ? (
            <p className="text-sm text-muted-foreground">
              Today: {aiUsage.used} of {aiUsage.limit} Pulse AI messages used
              {aiUsage.remaining > 0
                ? ` · ${aiUsage.remaining} remaining`
                : " · limit reached"}
            </p>
          ) : null}

          {isPro ? (
            <Button
              type="button"
              variant="outline"
              disabled={!dodoConfigured || portal.isPending}
              onClick={() => portal.mutate()}
            >
              {portal.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Opening portal…
                </>
              ) : (
                "Manage subscription"
              )}
            </Button>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className={cn(!isPro && "border-border/70")}>
          <CardHeader>
            <CardTitle>Free</CardTitle>
            <CardDescription>For exploring Pulse</CardDescription>
            <p className="pt-2 text-3xl font-semibold tracking-tight">
              {freePriceFormatted}
            </p>
          </CardHeader>
          <CardContent>
            <PlanFeatureList items={FREE_PLAN_FEATURES} />
          </CardContent>
          <CardFooter>
            {isPro ? (
              <p className="text-sm text-muted-foreground">
                Included with every account
              </p>
            ) : (
              <Badge variant="secondary">Current plan</Badge>
            )}
          </CardFooter>
        </Card>

        <Card
          className={cn(
            "border-warm-muted/40 bg-linear-to-br from-warm/8 via-card to-accent/15",
            isPro && "ring-1 ring-warm-muted/30",
          )}
        >
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Pro</CardTitle>
              {isPro ? <Badge>Current plan</Badge> : null}
            </div>
            <CardDescription>Unlimited AI for power users</CardDescription>
            <p className="pt-2 text-3xl font-semibold tracking-tight">
              {proPrice.formatted}
              <span className="text-base font-normal text-muted-foreground">
                {" "}
                / month
              </span>
            </p>
            <p className="text-xs text-muted-foreground">
              Billed in USD. UPI, cards, and more at checkout.
            </p>
          </CardHeader>
          <CardContent>
            <PlanFeatureList items={PRO_PLAN_FEATURES} />
          </CardContent>
          <CardFooter>
            {isPro ? (
              <p className="text-sm text-muted-foreground">
                Manage billing in the customer portal
              </p>
            ) : (
              <Button
                type="button"
                className="w-full"
                disabled={!dodoConfigured || checkout.isPending}
                onClick={() => checkout.mutate()}
              >
                {checkout.isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Redirecting…
                  </>
                ) : dodoConfigured ? (
                  `Upgrade — ${proPrice.formatted}/mo`
                ) : (
                  "Checkout available after Dodo setup"
                )}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>

      {!dodoConfigured ? (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-base">Payments not configured</CardTitle>
            <CardDescription>
              Add Dodo Payments API keys and a Pro product ID to enable checkout.
              Your plan limits still apply until you upgrade.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      <Separator />

      <p className="text-xs leading-relaxed text-muted-foreground">
        Payments are processed by Dodo Payments. Taxes and local payment methods
        (UPI, cards, and more) are handled at checkout. Cancel anytime from the
        customer portal.
      </p>
    </div>
  )
}
