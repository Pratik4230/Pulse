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
import { createRequestTimer } from "@/lib/request-timer"

export const runtime = "nodejs"

export async function GET(request: Request) {
  const timer = createRequestTimer("GET /api/calendar/events")

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

    if (integrations.googlecalendar !== "connected") {
      return timer.json(
        {
          error: "Google Calendar is not connected",
          code: "CALENDAR_NOT_CONNECTED",
        },
        { status: 403 },
      )
    }

    await timer.time("ensure_corsair_tenant", () =>
      ensureCorsairTenant(tenantId),
    )

    const { searchParams } = new URL(request.url)
    const parsedQuery = calendarEventsQuerySchema.safeParse({
      days: searchParams.get("days") ?? undefined,
      pageToken: searchParams.get("pageToken") ?? undefined,
      start: searchParams.get("start") ?? undefined,
    })
    if (!parsedQuery.success) {
      return timer.json({ error: "Invalid calendar query" }, { status: 400 })
    }
    const days = parsedQuery.data.days ?? null
    const pageToken = parsedQuery.data.pageToken
    const start = parsedQuery.data.start

    const result = await timer.time("list_upcoming_events", () =>
      listUpcomingEvents(tenantId, days, pageToken, start),
    )

    return timer.json(result)
  } catch (err) {
    if (isCalendarNotConnectedError(err)) {
      return timer.json(
        {
          error: "Google Calendar is not connected",
          code: "CALENDAR_NOT_CONNECTED",
        },
        { status: 403 },
      )
    }

    const message =
      err instanceof Error ? err.message : "Failed to load calendar events"
    return timer.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const timer = createRequestTimer("POST /api/calendar/events")

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

    if (integrations.googlecalendar !== "connected") {
      return timer.json(
        {
          error: "Google Calendar is not connected",
          code: "CALENDAR_NOT_CONNECTED",
        },
        { status: 403 },
      )
    }

    await timer.time("ensure_corsair_tenant", () =>
      ensureCorsairTenant(tenantId),
    )

    const parsedBody = createCalendarEventSchema.safeParse(await request.json())
    if (!parsedBody.success) {
      return timer.json({ error: "Invalid event payload" }, { status: 400 })
    }
    const body = parsedBody.data as CreateCalendarEventInput
    const locale = resolveUserLocale(session.user)

    const event = await timer.time("create_calendar_event", () =>
      createCalendarEvent(tenantId, body, { timeZone: locale.timezone }),
    )

    return timer.json({ event })
  } catch (err) {
    if (isCalendarNotConnectedError(err)) {
      return timer.json(
        {
          error: "Google Calendar is not connected",
          code: "CALENDAR_NOT_CONNECTED",
        },
        { status: 403 },
      )
    }

    const message =
      err instanceof Error ? err.message : "Failed to create calendar event"
    return timer.json({ error: message }, { status: 500 })
  }
}

function isCalendarNotConnectedError(err: unknown) {
  if (!(err instanceof Error)) return false
  return (
    err.message.includes("not connected") ||
    err.message.includes("OAuth credentials are missing")
  )
}
