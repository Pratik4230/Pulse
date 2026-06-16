import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"

import type {
  CalendarEventsResponse,
  CreateCalendarEventInput,
} from "../types"

async function fetchCalendarEvents({
  days,
  pageToken,
}: {
  days?: number | null
  pageToken?: string
}) {
  const params = new URLSearchParams()
  if (typeof days === "number") {
    params.set("days", String(days))
  }
  if (pageToken) {
    params.set("pageToken", pageToken)
  }
  const query = params.toString()
  const response = await fetch(
    query ? `/api/calendar/events?${query}` : "/api/calendar/events",
  )

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

export function calendarEventsQueryKey(days?: number | null) {
  return ["calendar", "events", days ?? "all"] as const
}

export function useCalendarEvents(days?: number | null, enabled = true) {
  return useInfiniteQuery({
    queryKey: calendarEventsQueryKey(days),
    queryFn: ({ pageParam }) =>
      fetchCalendarEvents({ days, pageToken: pageParam as string | undefined }),
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

export function useCreateCalendarEvent(days?: number | null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createCalendarEvent,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: calendarEventsQueryKey(days),
      })
    },
  })
}
