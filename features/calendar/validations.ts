import * as z from "zod"

export const calendarEventsQuerySchema = z.object({
  days: z.coerce.number().int().min(1).max(30).optional(),
  pageToken: z.string().min(1).max(500).optional(),
})

export const createCalendarEventSchema = z.object({
  title: z.string().trim().min(1).max(200),
  start: z.string().min(1).max(100),
  end: z.string().min(1).max(100),
  attendees: z.array(z.email().max(255)).max(50).optional(),
  description: z.string().max(5000).optional(),
  location: z.string().max(500).optional(),
})
