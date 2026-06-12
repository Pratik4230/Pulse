import { NextResponse } from "next/server"
import { generateOAuthUrl } from "corsair/oauth"

import { corsair } from "@/features/integrations/corsair/corsair"
import {
  CORSAIR_TENANT_ID,
  getCorsairOAuthRedirectUri,
} from "@/lib/corsair-oauth"

export async function GET() {
  try {
    const { url } = await generateOAuthUrl(corsair, "gmail", {
      tenantId: CORSAIR_TENANT_ID,
      redirectUri: getCorsairOAuthRedirectUri(),
    })

    return NextResponse.redirect(url)
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to start Gmail OAuth"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
