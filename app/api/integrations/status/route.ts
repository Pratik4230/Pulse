import { NextResponse } from "next/server"

import { getIntegrationStatuses } from "@/features/integrations/core/server/tenant"
import { getSessionFromRequest } from "@/features/integrations/core/server/session"

export async function GET(request: Request) {
  const session = await getSessionFromRequest(request)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const integrations = await getIntegrationStatuses(session.user.id)
    return NextResponse.json({ integrations })
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to load integrations"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
