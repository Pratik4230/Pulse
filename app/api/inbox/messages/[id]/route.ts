import { getInboxThread } from "@/features/inbox/server/gmail"
import { getSessionFromRequest } from "@/features/integrations/core/server/session"
import {
  ensureCorsairTenant,
  getIntegrationStatuses,
} from "@/features/integrations/core/server/tenant"
import { createRequestTimer } from "@/lib/request-timer"

export const runtime = "nodejs"

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(request: Request, context: RouteContext) {
  const timer = createRequestTimer("GET /api/inbox/messages/[id]")

  const session = await timer.time("session", () =>
    getSessionFromRequest(request),
  )

  if (!session) {
    return timer.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await context.params
  const tenantId = session.user.id

  try {
    const integrations = await timer.time("integration_status", () =>
      getIntegrationStatuses(tenantId),
    )

    if (integrations.gmail !== "connected") {
      return timer.json(
        { error: "Gmail is not connected", code: "GMAIL_NOT_CONNECTED" },
        { status: 403 },
      )
    }

    await timer.time("ensure_corsair_tenant", () =>
      ensureCorsairTenant(tenantId),
    )

    const thread = await timer.time("get_inbox_thread", () =>
      getInboxThread(tenantId, id),
    )

    if (!thread) {
      return timer.json({ error: "Message not found" }, { status: 404 })
    }

    return timer.json({ thread })
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to load message"
    return timer.json({ error: message }, { status: 500 })
  }
}
