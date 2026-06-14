import { createCalendarEvent } from "@/features/calendar/server/calendar"
import {
  calendarRawListEvents,
  type CalendarRawEvent,
} from "@/features/calendar/server/calendar-raw"
import { gmailRawSendMessage } from "@/features/inbox/server/gmail-raw"

export type ScheduleAndNotifyInput = {
  title: string
  start: string
  end: string
  attendeeEmail: string
  emailSubject: string
  emailBody: string
  location?: string
  description?: string
}

export type ScheduleAndNotifyResult = {
  calendarCreated: boolean
  calendarDuplicate: boolean
  emailSent: boolean
  eventTitle: string
  start: string
  end: string
  attendeeEmail: string
  messageId?: string | null
}

function eventStartMs(event: CalendarRawEvent) {
  const value = event.start?.dateTime ?? event.start?.date
  if (!value) return null
  const ms = new Date(value).getTime()
  return Number.isNaN(ms) ? null : ms
}

function findMatchingEvent(
  events: CalendarRawEvent[],
  title: string,
  attendeeEmail: string,
  startIso: string,
) {
  const targetTitle = title.trim().toLowerCase()
  const targetEmail = attendeeEmail.trim().toLowerCase()
  const targetStart = new Date(startIso).getTime()

  return (
    events.find((event) => {
      if (event.status === "cancelled") return false

      const summary = event.summary?.trim().toLowerCase()
      if (summary !== targetTitle) return false

      const hasAttendee = event.attendees?.some(
        (attendee) => attendee.email?.trim().toLowerCase() === targetEmail,
      )
      if (!hasAttendee) return false

      const startMs = eventStartMs(event)
      if (startMs == null) return false

      return Math.abs(startMs - targetStart) < 60_000
    }) ?? null
  )
}

export async function scheduleAndNotify(
  tenantId: string,
  senderEmail: string,
  input: ScheduleAndNotifyInput,
  options?: { timeZone?: string },
): Promise<ScheduleAndNotifyResult> {
  const attendeeEmail = input.attendeeEmail.trim()
  const title = input.title.trim()

  if (!title || !attendeeEmail) {
    throw new Error("Event title and attendee email are required")
  }

  const startMs = new Date(input.start).getTime()
  const endMs = new Date(input.end).getTime()
  if (Number.isNaN(startMs) || Number.isNaN(endMs) || endMs <= startMs) {
    throw new Error("Invalid start or end time")
  }

  const windowStart = new Date(startMs - 60 * 60_000).toISOString()
  const windowEnd = new Date(endMs + 60 * 60_000).toISOString()

  const existingResponse = await calendarRawListEvents(tenantId, {
    timeMin: windowStart,
    timeMax: windowEnd,
    singleEvents: true,
    orderBy: "startTime",
    maxResults: 25,
    q: attendeeEmail,
  })

  const duplicate = findMatchingEvent(
    existingResponse.items ?? [],
    title,
    attendeeEmail,
    input.start,
  )

  let calendarCreated = false

  if (!duplicate) {
    await createCalendarEvent(
      tenantId,
      {
        title,
        start: input.start,
        end: input.end,
        attendees: [attendeeEmail],
        location: input.location,
        description: input.description,
      },
      { timeZone: options?.timeZone },
    )
    calendarCreated = true
  }

  let messageId: string | null = null

  try {
    const sent = await gmailRawSendMessage(tenantId, {
      from: senderEmail,
      to: attendeeEmail,
      subject: input.emailSubject.trim(),
      body: input.emailBody,
    })
    messageId = sent.id ?? null
  } catch (err) {
    const reason = err instanceof Error ? err.message : "Failed to send email"
    throw new Error(`Calendar saved but Gmail confirmation failed: ${reason}`)
  }

  return {
    calendarCreated,
    calendarDuplicate: Boolean(duplicate),
    emailSent: true,
    eventTitle: title,
    start: input.start,
    end: input.end,
    attendeeEmail,
    messageId,
  }
}
