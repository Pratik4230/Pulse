import { enrichInboxListItems } from "@/features/inbox/server/gmail"
import type { InboxFilter } from "@/features/inbox/types"
import { getSessionFromRequest } from "@/features/integrations/core/server/session"
import {
  ensureCorsairTenant,
  getIntegrationStatuses,
} from "@/features/integrations/core/server/tenant"
import { createRequestTimer } from "@/lib/request-timer"

export const runtime = "nodejs"

const MAX_ENRICH_IDS = 24

function parseFilter(value: unknown): InboxFilter {
  return value === "unread" ? "unread" : "all"
}

export async function POST(request: Request) {
  const timer = createRequestTimer("POST /api/inbox/messages/enrich")

  const session = await timer.time("session", () =>
    getSessionFromRequest(request),
  )

  if (!session) {
    return timer.json({ error: "Unauthorized" }, { status: 401 })
  }

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

    const body = (await request.json()) as {
      ids?: unknown
      filter?: unknown
    }

    const ids = Array.isArray(body.ids)
      ? body.ids.filter((id): id is string => typeof id === "string").slice(0, MAX_ENRICH_IDS)
      : []

    if (ids.length === 0) {
      return timer.json({ messages: [] })
    }

    const filter = parseFilter(body.filter)

    const messages = await timer.time("enrich_inbox_list_items", () =>
      enrichInboxListItems(tenantId, ids, filter),
    )

    return timer.json({ messages })
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to enrich inbox messages"
    return timer.json({ error: message }, { status: 500 })
  }
}
