import { NextResponse } from "next/server"

import { getInboxThread } from "@/features/inbox/server/gmail"
import { getSessionFromRequest } from "@/features/integrations/core/server/session"
import {
  ensureCorsairTenant,
  getIntegrationStatuses,
} from "@/features/integrations/core/server/tenant"
import { userRateLimitResponse } from "@/lib/rate-limit"

export const runtime = "nodejs"

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(request: Request, context: RouteContext) {
  const session = await getSessionFromRequest(request)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const limited = await userRateLimitResponse(session.user.id, "inbox")
  if (limited) {
    return limited
  }

  const { id } = await context.params
  const tenantId = session.user.id

  try {
    const integrations = await getIntegrationStatuses(tenantId)

    if (integrations.gmail !== "connected") {
      return NextResponse.json(
        { error: "Gmail is not connected", code: "GMAIL_NOT_CONNECTED" },
        { status: 403 },
      )
    }

    await ensureCorsairTenant(tenantId)

    const thread = await getInboxThread(tenantId, id)

    if (!thread) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 })
    }

    return NextResponse.json({ thread })
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to load message"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
