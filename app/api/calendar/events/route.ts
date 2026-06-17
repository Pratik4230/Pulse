import { NextResponse } from "next/server"

import {
  createCalendarEvent,
  listUpcomingEvents,
} from "@/features/calendar/server/calendar"
import type { CreateCalendarEventInput } from "@/features/calendar/types"
import {
  calendarEventsQuerySchema,
  createCalendarEventSchema,
} from "@/features/calendar/validations"
import { getSessionFromRequest } from "@/features/integrations/core/server/session"
import {
  ensureCorsairTenant,
  getIntegrationStatuses,
} from "@/features/integrations/core/server/tenant"
import { resolveUserLocale } from "@/lib/locale"

export const runtime = "nodejs"

export async function GET(request: Request) {
  const session = await getSessionFromRequest(request)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const tenantId = session.user.id

  try {
    const integrations = await getIntegrationStatuses(tenantId)

    if (integrations.googlecalendar !== "connected") {
      return NextResponse.json(
        {
          error: "Google Calendar is not connected",
          code: "CALENDAR_NOT_CONNECTED",
        },
        { status: 403 },
      )
    }

    await ensureCorsairTenant(tenantId)

    const { searchParams } = new URL(request.url)
    const parsedQuery = calendarEventsQuerySchema.safeParse({
      days: searchParams.get("days") ?? undefined,
      pageToken: searchParams.get("pageToken") ?? undefined,
      start: searchParams.get("start") ?? undefined,
    })
    if (!parsedQuery.success) {
      return NextResponse.json({ error: "Invalid calendar query" }, { status: 400 })
    }
    const days = parsedQuery.data.days ?? null
    const pageToken = parsedQuery.data.pageToken
    const start = parsedQuery.data.start

    const result = await listUpcomingEvents(tenantId, days, pageToken, start)

    return NextResponse.json(result)
  } catch (err) {
    if (isCalendarNotConnectedError(err)) {
      return NextResponse.json(
        {
          error: "Google Calendar is not connected",
          code: "CALENDAR_NOT_CONNECTED",
        },
        { status: 403 },
      )
    }

    const message =
      err instanceof Error ? err.message : "Failed to load calendar events"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getSessionFromRequest(request)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const tenantId = session.user.id

  try {
    const integrations = await getIntegrationStatuses(tenantId)

    if (integrations.googlecalendar !== "connected") {
      return NextResponse.json(
        {
          error: "Google Calendar is not connected",
          code: "CALENDAR_NOT_CONNECTED",
        },
        { status: 403 },
      )
    }

    await ensureCorsairTenant(tenantId)

    const parsedBody = createCalendarEventSchema.safeParse(await request.json())
    if (!parsedBody.success) {
      return NextResponse.json({ error: "Invalid event payload" }, { status: 400 })
    }
    const body = parsedBody.data as CreateCalendarEventInput
    const locale = resolveUserLocale(session.user)

    const event = await createCalendarEvent(tenantId, body, { timeZone: locale.timezone })

    return NextResponse.json({ event })
  } catch (err) {
    if (isCalendarNotConnectedError(err)) {
      return NextResponse.json(
        {
          error: "Google Calendar is not connected",
          code: "CALENDAR_NOT_CONNECTED",
        },
        { status: 403 },
      )
    }

    const message =
      err instanceof Error ? err.message : "Failed to create calendar event"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

function isCalendarNotConnectedError(err: unknown) {
  if (!(err instanceof Error)) return false
  return (
    err.message.includes("not connected") ||
    err.message.includes("OAuth credentials are missing")
  )
}
