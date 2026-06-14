"use client"

import { Calendar, Clock, ExternalLink, MapPin, Users } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

import type { CalendarEventItem } from "../types"

type CalendarEventListProps = {
  events: CalendarEventItem[] | undefined
  isLoading: boolean
  isError: boolean
  selectedId: string | null
  onSelect: (id: string) => void
}

function parseEventDate(value: string, isAllDay: boolean) {
  if (isAllDay) {
    const [year, month, day] = value.split("-").map(Number)
    return new Date(year, month - 1, day)
  }
  return new Date(value)
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function formatDayLabel(date: Date) {
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  if (isSameDay(date, today)) return "Today"
  if (isSameDay(date, tomorrow)) return "Tomorrow"

  return new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(date)
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(date)
}

function formatEventTime(event: CalendarEventItem) {
  if (event.isAllDay) return "All day"

  const start = parseEventDate(event.start, false)
  const end = parseEventDate(event.end, false)
  return `${formatTime(start)} to ${formatTime(end)}`
}

function getDayKey(event: CalendarEventItem) {
  const date = parseEventDate(event.start, event.isAllDay)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function groupEventsByDay(events: CalendarEventItem[]) {
  const groups = new Map<string, CalendarEventItem[]>()

  for (const event of events) {
    const key = getDayKey(event)
    const existing = groups.get(key) ?? []
    existing.push(event)
    groups.set(key, existing)
  }

  return Array.from(groups.entries())
}

function CalendarEventListSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
      ))}
    </div>
  )
}

export function CalendarEventList({
  events,
  isLoading,
  isError,
  selectedId,
  onSelect,
}: CalendarEventListProps) {
  if (isLoading && !events?.length) {
    return <CalendarEventListSkeleton />
  }

  if (isError) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-sm text-muted-foreground">
        Failed to load events. Try refreshing.
      </div>
    )
  }

  if (!events?.length) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
        <Calendar className="size-8 text-muted-foreground/60" />
        <p className="text-sm font-medium">No upcoming events</p>
        <p className="max-w-xs text-sm text-muted-foreground">
          Your calendar is clear for the next 7 days. Create an event to get
          started.
        </p>
      </div>
    )
  }

  const grouped = groupEventsByDay(events)

  return (
    <ScrollArea className="h-full min-h-0 flex-1">
      <div className="space-y-6 p-4">
        {grouped.map(([dayKey, dayEvents]) => (
          <section key={dayKey}>
            <h3 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {formatDayLabel(parseEventDate(dayKey, true))}
            </h3>
            <div className="space-y-2">
              {dayEvents.map((event) => (
                <button
                  key={event.id}
                  type="button"
                  onClick={() => onSelect(event.id)}
                  className={cn(
                    "w-full rounded-xl border border-border/70 bg-card p-4 text-left transition-colors",
                    "hover:border-border hover:bg-card/90",
                    selectedId === event.id &&
                      "border-primary/40 bg-primary/5 ring-1 ring-primary/20",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{event.title}</p>
                      <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="size-3 shrink-0" />
                        <span>{formatEventTime(event)}</span>
                      </div>
                      {event.location ? (
                        <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <MapPin className="size-3 shrink-0" />
                          <span className="truncate">{event.location}</span>
                        </div>
                      ) : null}
                    </div>
                    {event.attendees.length > 0 ? (
                      <Badge variant="secondary" className="shrink-0 text-[10px]">
                        <Users className="mr-1 size-3" />
                        {event.attendees.length}
                      </Badge>
                    ) : null}
                  </div>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    </ScrollArea>
  )
}

type CalendarEventDetailProps = {
  event: CalendarEventItem | null
}

export function CalendarEventDetail({ event }: CalendarEventDetailProps) {
  if (!event) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-sm text-muted-foreground">
        Select an event to view details
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="border-b border-border/80 px-6 py-5">
        <h2 className="text-lg font-semibold tracking-tight">{event.title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {formatEventTime(event)}
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-5 px-6 py-5">
          {event.location ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Location
              </p>
              <p className="mt-1 text-sm">{event.location}</p>
            </div>
          ) : null}

          {event.description ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Description
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">
                {event.description}
              </p>
            </div>
          ) : null}

          {event.attendees.length > 0 ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Attendees
              </p>
              <ul className="mt-2 space-y-1">
                {event.attendees.map((attendee) => (
                  <li key={attendee.email} className="text-sm">
                    {attendee.displayName ?? attendee.email}
                    {attendee.displayName ? (
                      <span className="text-muted-foreground">
                        {" "}
                        · {attendee.email}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {event.htmlLink ? (
            <Button variant="outline" size="sm" asChild>
              <a href={event.htmlLink} target="_blank" rel="noreferrer">
                <ExternalLink className="size-4" />
                Open in Google Calendar
              </a>
            </Button>
          ) : null}
        </div>
      </ScrollArea>
    </div>
  )
}
