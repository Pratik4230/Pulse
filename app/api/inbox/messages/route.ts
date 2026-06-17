import { NextResponse } from "next/server"

import { listInboxPage } from "@/features/inbox/server/gmail"
import type { InboxFilter } from "@/features/inbox/types"
import { inboxMessagesQuerySchema } from "@/features/inbox/validations"
import { getSessionFromRequest } from "@/features/integrations/core/server/session"
import { ensureCorsairTenant, getIntegrationStatuses } from "@/features/integrations/core/server/tenant"

export const runtime = "nodejs"

export async function GET(request: Request) {
  const session = await getSessionFromRequest(request)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

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

    const { searchParams } = new URL(request.url)
    const parsedQuery = inboxMessagesQuerySchema.safeParse({
      filter: searchParams.get("filter") ?? undefined,
      pageToken: searchParams.get("pageToken") ?? undefined,
      q: searchParams.get("q") ?? undefined,
    })
    if (!parsedQuery.success) {
      return NextResponse.json({ error: "Invalid inbox query" }, { status: 400 })
    }
    const filter = (parsedQuery.data.filter ?? "all") as InboxFilter
    const pageToken = parsedQuery.data.pageToken
    const query = parsedQuery.data.q

    const page = await listInboxPage(tenantId, filter, pageToken, query)

    return NextResponse.json(page)
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to load inbox messages"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
