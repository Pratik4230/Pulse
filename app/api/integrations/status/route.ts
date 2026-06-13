import { getIntegrationStatuses } from "@/features/integrations/core/server/tenant"
import { getSessionFromRequest } from "@/features/integrations/core/server/session"
import { createRequestTimer } from "@/lib/request-timer"

export async function GET(request: Request) {
  const timer = createRequestTimer("GET /api/integrations/status")

  const session = await timer.time("session", () =>
    getSessionFromRequest(request),
  )

  if (!session) {
    return timer.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const integrations = await timer.time("integration_status", () =>
      getIntegrationStatuses(session.user.id),
    )
    return timer.json({ integrations })
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to load integrations"
    return timer.json({ error: message }, { status: 500 })
  }
}
