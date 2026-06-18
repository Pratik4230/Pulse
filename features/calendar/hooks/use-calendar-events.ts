import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"

import type {
  CalendarEventsResponse,
  CreateCalendarEventInput,
} from "../types"
import { throwApiError } from "@/lib/api-client"

async function fetchCalendarEvents({
  days,
  start,
  pageToken,
}: {
  days?: number | null
  start?: string
  pageToken?: string
}) {
  const params = new URLSearchParams()
  if (typeof days === "number") {
    params.set("days", String(days))
  }
  if (start) {
    params.set("start", start)
  }
  if (pageToken) {
    params.set("pageToken", pageToken)
  }
  const query = params.toString()
  const response = await fetch(
    query ? `/api/calendar/events?${query}` : "/api/calendar/events",
  )

  const data = (await response.json().catch(() => ({}))) as CalendarEventsResponse & {
    error?: string
    code?: string
    retryAfterSeconds?: number
  }

  if (!response.ok) {
    throwApiError(response.status, data)
  }

  return data
}

export async function fetchCalendarEventsPage(options: {
  days?: number | null
  start?: string
  pageToken?: string
}) {
  return fetchCalendarEvents(options)
}

async function createCalendarEvent(input: CreateCalendarEventInput) {
  const response = await fetch("/api/calendar/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })

  const data = (await response.json().catch(() => ({}))) as {
    event: CalendarEventsResponse["events"][number]
    error?: string
    code?: string
    retryAfterSeconds?: number
  }

  if (!response.ok) {
    throwApiError(response.status, data)
  }

  return data
}

export function calendarEventsQueryKey(
  days?: number | null,
  start?: string,
) {
  return ["calendar", "events", days ?? "all", start ?? ""] as const
}

export function useCalendarEvents(
  days?: number | null,
  enabled = true,
  start?: string,
) {
  return useInfiniteQuery({
    queryKey: calendarEventsQueryKey(days, start),
    queryFn: ({ pageParam }) =>
      fetchCalendarEvents({
        days,
        start,
        pageToken: pageParam as string | undefined,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextPageToken ?? undefined,
    enabled,
    staleTime: 60_000,
    select: (data) => {
      const events = data.pages.flatMap((page) => page.events)
      const uniqueEvents = Array.from(new Map(events.map((event) => [event.id, event])).values())
      return {
        ...data,
        events: uniqueEvents.sort((a, b) => a.start.localeCompare(b.start)),
      }
    },
  })
}

export function useCreateCalendarEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createCalendarEvent,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["calendar", "events"],
      })
    },
  })
}
