import { NextResponse } from "next/server"

import { startIntegrationOAuth } from "@/features/integrations/core/server/connect"
import { getSessionFromRequest } from "@/features/integrations/core/server/session"
import { userRateLimitResponse } from "@/lib/rate-limit"

export async function GET(request: Request) {
  const session = await getSessionFromRequest(request)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const limited = await userRateLimitResponse(
    session.user.id,
    "integration-connect",
  )
  if (limited) {
    return limited
  }

  try {
    const { url } = await startIntegrationOAuth("gmail", session.user.id)
    return NextResponse.redirect(url)
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to start Gmail OAuth"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
