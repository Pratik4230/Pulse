import { NextResponse } from "next/server"
import { processOAuthCallback } from "corsair/oauth"

import { corsair } from "@/features/integrations/core/corsair/corsair"
import {
  getAppBaseUrl,
  getCorsairOAuthRedirectUri,
} from "@/features/integrations/core/lib/oauth"
import type { IntegrationId } from "@/features/integrations/core/types"
import { invalidateIntegrationStatusCache } from "@/features/integrations/core/server/tenant"
import { registerIntegrationWebhooks } from "@/features/integrations/core/server/webhook-subscriptions"
import { ipRateLimitResponse } from "@/lib/rate-limit"

export async function GET(request: Request) {
  const limited = await ipRateLimitResponse(request, "oauth-callback")
  if (limited) {
    return limited
  }

  const url = new URL(request.url)
  const error = url.searchParams.get("error")
  const code = url.searchParams.get("code")
  const state = url.searchParams.get("state")

  if (error) {
    return NextResponse.json({ error }, { status: 400 })
  }

  if (!code || !state) {
    return NextResponse.json(
      { error: "Missing authorization code or state" },
      { status: 400 },
    )
  }

  try {
    const result = await processOAuthCallback(corsair, {
      code,
      state,
      redirectUri: getCorsairOAuthRedirectUri(),
    })

    invalidateIntegrationStatusCache(result.tenantId)

    void registerIntegrationWebhooks(
      result.tenantId,
      result.plugin as IntegrationId,
    ).catch((error) => {
      console.error("[webhooks] Failed to register push watches:", error)
    })

    const successUrl = new URL("/settings/integrations", getAppBaseUrl())
    successUrl.searchParams.set("connected", result.plugin)
    return NextResponse.redirect(successUrl)
  } catch (err) {
    const message = err instanceof Error ? err.message : "OAuth callback failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
