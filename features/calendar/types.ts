export type CalendarAttendee = {
  email: string
  displayName?: string
}

export type CalendarEventItem = {
  id: string
  title: string
  description?: string
  location?: string
  start: string
  end: string
  isAllDay: boolean
  htmlLink?: string
  attendees: CalendarAttendee[]
  hangoutLink?: string
}

export type CalendarEventsResponse = {
  events: CalendarEventItem[]
  timeMin: string
  timeMax: string | null
  nextPageToken: string | null
}

export type CreateCalendarEventInput = {
  title: string
  start: string
  end: string
  attendees?: string[]
  description?: string
  location?: string
}
