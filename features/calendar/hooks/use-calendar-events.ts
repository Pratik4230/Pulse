import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import type {
  CalendarEventsResponse,
  CreateCalendarEventInput,
} from "../types"

async function fetchCalendarEvents(days = 7) {
  const params = new URLSearchParams({ days: String(days) })
  const response = await fetch(`/api/calendar/events?${params}`)

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as {
      error?: string
      code?: string
    } | null
    const error = new Error(data?.error ?? "Failed to load calendar events")
    ;(error as Error & { code?: string }).code = data?.code
    throw error
  }

  return response.json() as Promise<CalendarEventsResponse>
}

async function createCalendarEvent(input: CreateCalendarEventInput) {
  const response = await fetch("/api/calendar/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as {
      error?: string
    } | null
    throw new Error(data?.error ?? "Failed to create calendar event")
  }

  return response.json() as Promise<{ event: CalendarEventsResponse["events"][number] }>
}

export function calendarEventsQueryKey(days = 7) {
  return ["calendar", "events", days] as const
}

export function useCalendarEvents(days = 7, enabled = true) {
  return useQuery({
    queryKey: calendarEventsQueryKey(days),
    queryFn: () => fetchCalendarEvents(days),
    enabled,
    staleTime: 60_000,
  })
}

export function useCreateCalendarEvent(days = 7) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createCalendarEvent,
    onSuccess: ({ event }) => {
      queryClient.setQueryData<CalendarEventsResponse>(
        calendarEventsQueryKey(days),
        (current) => {
          if (!current) return current
          const events = [...current.events, event].sort((a, b) =>
            a.start.localeCompare(b.start),
          )
          return { ...current, events }
        },
      )
    },
  })
}
