"use client"

import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"

import { DODO_PRO_PRODUCT_SLUG } from "@/lib/billing/dodo-config"
import { authClient } from "@/lib/auth-client"

async function startProCheckout() {
  const result = await authClient.dodopayments.checkoutSession({
    slug: DODO_PRO_PRODUCT_SLUG,
  })

  if (result.error) {
    throw new Error(result.error.message ?? "Could not start checkout")
  }

  if (!result.data?.url) {
    throw new Error("Checkout URL was not returned")
  }

  window.location.href = result.data.url
}

async function openCustomerPortal() {
  const result = await authClient.dodopayments.customer.portal()

  if (result.error) {
    throw new Error(result.error.message ?? "Could not open billing portal")
  }

  if (!result.data?.url) {
    throw new Error("Portal URL was not returned")
  }

  window.location.href = result.data.url
}

export function useBillingActions() {
  const checkout = useMutation({
    mutationFn: startProCheckout,
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Could not start checkout",
      )
    },
  })

  const portal = useMutation({
    mutationFn: openCustomerPortal,
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Could not open billing portal",
      )
    },
  })

  return { checkout, portal }
}
