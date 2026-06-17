import { useQueries } from "@tanstack/react-query"
import { useCallback, useMemo, useState } from "react"

import {
  addDays,
  formatDateKey,
  parseLocalDate,
  startOfWeek,
} from "../lib/week"
import type { CalendarEventItem } from "../types"
import {
  calendarEventsQueryKey,
  fetchCalendarEventsPage,
} from "./use-calendar-events"

const WEEKS_PER_LOAD = 2
const INITIAL_WEEKS = 4

function buildInitialWeekStarts() {
  const start = startOfWeek(new Date())
  return Array.from({ length: INITIAL_WEEKS }, (_, index) =>
    formatDateKey(addDays(start, index * 7)),
  )
}

export type CalendarWeekSlice = {
  start: Date
  events: CalendarEventItem[]
  isLoading: boolean
}

export function useCalendarWeeks(enabled: boolean) {
  const [weekStarts, setWeekStarts] = useState<string[]>(buildInitialWeekStarts)

  const results = useQueries({
    queries: weekStarts.map((start) => ({
      queryKey: calendarEventsQueryKey(7, start),
      queryFn: () => fetchCalendarEventsPage({ days: 7, start }),
      enabled,
      staleTime: 60_000,
    })),
  })

  const weeks = useMemo<CalendarWeekSlice[]>(
    () =>
      weekStarts.map((start, index) => ({
        start: parseLocalDate(start),
        events: results[index]?.data?.events ?? [],
        isLoading: results[index]?.isLoading ?? false,
      })),
    [results, weekStarts],
  )

  const isFetchingMore = results
    .slice(Math.max(0, weekStarts.length - WEEKS_PER_LOAD))
    .some((result) => result.isFetching)

  const isInitialLoading = results[0]?.isLoading ?? false

  const loadMoreWeeks = useCallback(() => {
    setWeekStarts((current) => {
      const lastStart = parseLocalDate(current[current.length - 1]!)
      const additions = Array.from({ length: WEEKS_PER_LOAD }, (_, index) =>
        formatDateKey(addDays(lastStart, 7 * (index + 1))),
      )
      return [...current, ...additions]
    })
  }, [])

  const allEvents = useMemo(
    () =>
      Array.from(
        new Map(weeks.flatMap((week) => week.events).map((event) => [event.id, event]))
          .values(),
      ).sort((a, b) => a.start.localeCompare(b.start)),
    [weeks],
  )

  return {
    weeks,
    allEvents,
    loadMoreWeeks,
    isFetchingMore,
    isInitialLoading,
  }
}
