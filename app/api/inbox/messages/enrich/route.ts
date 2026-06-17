import { NextResponse } from "next/server"

import { enrichInboxListItems } from "@/features/inbox/server/gmail"
import type { InboxFilter } from "@/features/inbox/types"
import { getSessionFromRequest } from "@/features/integrations/core/server/session"
import {
  ensureCorsairTenant,
  getIntegrationStatuses,
} from "@/features/integrations/core/server/tenant"

export const runtime = "nodejs"

const MAX_ENRICH_IDS = 24

function parseFilter(value: unknown): InboxFilter {
  return value === "unread" ? "unread" : "all"
}

export async function POST(request: Request) {
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

    const body = (await request.json()) as {
      ids?: unknown
      filter?: unknown
    }

    const ids = Array.isArray(body.ids)
      ? body.ids.filter((id): id is string => typeof id === "string").slice(0, MAX_ENRICH_IDS)
      : []

    if (ids.length === 0) {
      return NextResponse.json({ messages: [] })
    }

    const filter = parseFilter(body.filter)

    const messages = await enrichInboxListItems(tenantId, ids, filter)

    return NextResponse.json({ messages })
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to enrich inbox messages"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
