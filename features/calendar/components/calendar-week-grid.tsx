"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

import {
  formatDateKey,
  formatEventClockTime,
  getEventDayKey,
  getWeekDays,
  isSameDay,
} from "../lib/week"
import type { CalendarEventItem } from "../types"

type CalendarWeekGridProps = {
  weekStart: Date
  events: CalendarEventItem[] | undefined
  selectedId: string | null
  onSelect: (id: string) => void
  isLoading?: boolean
}

function groupEventsByDay(events: CalendarEventItem[]) {
  const groups = new Map<string, CalendarEventItem[]>()

  for (const event of events) {
    const key = getEventDayKey(event.start, event.isAllDay)
    const existing = groups.get(key) ?? []
    existing.push(event)
    groups.set(key, existing)
  }

  return groups
}

export function CalendarWeekGrid({
  weekStart,
  events,
  selectedId,
  onSelect,
  isLoading = false,
}: CalendarWeekGridProps) {
  const today = new Date()
  const weekDays = getWeekDays(weekStart)
  const grouped = groupEventsByDay(events ?? [])

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      <div className="grid h-full min-h-0 w-full grid-cols-7 divide-x divide-border/70">
        {weekDays.map((day) => {
          const dayKey = formatDateKey(day)
          const dayEvents = grouped.get(dayKey) ?? []
          const isToday = isSameDay(day, today)

          return (
            <div
              key={dayKey}
              className={cn(
                "flex min-h-0 min-w-0 flex-col overflow-hidden bg-card/30",
                isToday && "bg-primary/5",
              )}
            >
              <div
                className={cn(
                  "border-b border-border/70 px-2 py-2 text-center",
                  isToday && "bg-primary/10",
                )}
              >
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {new Intl.DateTimeFormat(undefined, {
                    weekday: "short",
                  }).format(day)}
                </p>
                <p
                  className={cn(
                    "mt-0.5 text-sm font-semibold tabular-nums",
                    isToday ? "text-primary" : "text-foreground",
                  )}
                >
                  {day.getDate()}
                </p>
              </div>

              <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto p-1.5">
                {isLoading && dayEvents.length === 0 ? (
                  <Skeleton className="h-12 w-full rounded-md" />
                ) : dayEvents.length === 0 ? (
                  <p className="px-1 py-2 text-center text-[10px] text-muted-foreground/70">
                    —
                  </p>
                ) : (
                  dayEvents.map((event) => (
                    <button
                      key={event.id}
                      type="button"
                      onClick={() => onSelect(event.id)}
                      className={cn(
                        "w-full rounded-md border border-border/60 bg-card px-2 py-1.5 text-left transition-colors",
                        "hover:border-border hover:bg-card/90",
                        selectedId === event.id &&
                          "border-primary/40 bg-primary/10 ring-1 ring-primary/20",
                      )}
                    >
                      <p className="truncate text-[11px] font-medium leading-tight">
                        {event.title}
                      </p>
                      <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
                        {formatEventClockTime(event.start, event.isAllDay)}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
