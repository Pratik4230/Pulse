import type {
  CalendarEventItem,
  CalendarEventsResponse,
  CreateCalendarEventInput,
} from "../types"
import {
  calendarRawCreateEvent,
  calendarRawListEvents,
  type CalendarRawEvent,
} from "./calendar-raw"

const DEFAULT_DAYS = 7
const MAX_EVENTS = 100

function parseEventTime(time?: { date?: string; dateTime?: string }) {
  if (!time) return { iso: "", isAllDay: false }
  if (time.date) {
    return { iso: time.date, isAllDay: true }
  }
  return { iso: time.dateTime ?? "", isAllDay: false }
}

function toCalendarEventItem(event: CalendarRawEvent): CalendarEventItem | null {
  if (!event.id || event.status === "cancelled") return null

  const start = parseEventTime(event.start)
  const end = parseEventTime(event.end)

  return {
    id: event.id,
    title: event.summary?.trim() || "(No title)",
    description: event.description,
    location: event.location,
    start: start.iso,
    end: end.iso,
    isAllDay: start.isAllDay,
    htmlLink: event.htmlLink,
    hangoutLink: event.hangoutLink,
    attendees:
      event.attendees
        ?.filter((attendee) => attendee.email)
        .map((attendee) => ({
          email: attendee.email!,
          displayName: attendee.displayName,
        })) ?? [],
  }
}

function getRange(days: number) {
  const timeMin = new Date()
  timeMin.setHours(0, 0, 0, 0)

  const timeMax = new Date(timeMin)
  timeMax.setDate(timeMax.getDate() + days)

  return {
    timeMin: timeMin.toISOString(),
    timeMax: timeMax.toISOString(),
  }
}

export async function listUpcomingEvents(
  tenantId: string,
  days = DEFAULT_DAYS,
): Promise<CalendarEventsResponse> {
  const { timeMin, timeMax } = getRange(days)

  const response = await calendarRawListEvents(tenantId, {
    timeMin,
    timeMax,
    maxResults: MAX_EVENTS,
    singleEvents: true,
    orderBy: "startTime",
  })

  const events =
    response.items
      ?.map(toCalendarEventItem)
      .filter((event): event is CalendarEventItem => event != null) ?? []

  return { events, timeMin, timeMax }
}

function toEventDateTime(iso: string, timeZone?: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid date or time")
  }

  return {
    dateTime: date.toISOString(),
    timeZone: timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
  }
}

export async function createCalendarEvent(
  tenantId: string,
  input: CreateCalendarEventInput,
  options?: { timeZone?: string },
): Promise<CalendarEventItem> {
  const title = input.title.trim()
  if (!title) {
    throw new Error("Event title is required")
  }

  const attendees = (input.attendees ?? [])
    .map((email) => email.trim())
    .filter(Boolean)
    .map((email) => ({ email }))

  const created = await calendarRawCreateEvent(tenantId, {
    event: {
      summary: title,
      description: input.description?.trim() || undefined,
      location: input.location?.trim() || undefined,
      start: toEventDateTime(input.start, options?.timeZone),
      end: toEventDateTime(input.end, options?.timeZone),
      attendees: attendees.length > 0 ? attendees : undefined,
    },
    sendUpdates: attendees.length > 0 ? "all" : "none",
  })

  const item = toCalendarEventItem(created)
  if (!item) {
    throw new Error("Failed to create calendar event")
  }

  return item
}
