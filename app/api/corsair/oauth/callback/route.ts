import { NextResponse } from "next/server"
import { processOAuthCallback } from "corsair/oauth"

import { corsair } from "@/features/integrations/corsair/corsair"
import { APP_HOME_PATH } from "@/lib/constants"
import {
  getAppBaseUrl,
  getCorsairOAuthRedirectUri,
} from "@/lib/corsair-oauth"

export async function GET(request: Request) {
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

    const successUrl = new URL(APP_HOME_PATH, getAppBaseUrl())
    successUrl.searchParams.set("connected", result.plugin)
    return NextResponse.redirect(successUrl)
  } catch (err) {
    const message = err instanceof Error ? err.message : "OAuth callback failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
