import { listInboxPage } from "@/features/inbox/server/gmail"
import type { InboxFilter } from "@/features/inbox/types"
import { inboxMessagesQuerySchema } from "@/features/inbox/validations"
import { getSessionFromRequest } from "@/features/integrations/core/server/session"
import { ensureCorsairTenant, getIntegrationStatuses } from "@/features/integrations/core/server/tenant"
import { createRequestTimer } from "@/lib/request-timer"

export const runtime = "nodejs"

export async function GET(request: Request) {
  const timer = createRequestTimer("GET /api/inbox/messages")

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

    const { searchParams } = new URL(request.url)
    const parsedQuery = inboxMessagesQuerySchema.safeParse({
      filter: searchParams.get("filter") ?? undefined,
      pageToken: searchParams.get("pageToken") ?? undefined,
    })
    if (!parsedQuery.success) {
      return timer.json({ error: "Invalid inbox query" }, { status: 400 })
    }
    const filter = (parsedQuery.data.filter ?? "all") as InboxFilter
    const pageToken = parsedQuery.data.pageToken

    const page = await timer.time("list_inbox_page", () =>
      listInboxPage(tenantId, filter, pageToken),
    )

    return timer.json(page)
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to load inbox messages"
    return timer.json({ error: message }, { status: 500 })
  }
}
