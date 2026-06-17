"use client"

import {
  CalendarDays,
  Clock,
  ExternalLink,
  MapPin,
  Users,
  Video,
} from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

import { parseLocalDate } from "../lib/week"
import type { CalendarEventItem } from "../types"

function parseEventInstant(value: string, isAllDay: boolean) {
  if (isAllDay) return parseLocalDate(value)
  return new Date(value)
}

function formatEventDateHeading(start: string, isAllDay: boolean) {
  const date = parseEventInstant(start, isAllDay)
  return new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date)
}

function formatEventTimeRange(event: CalendarEventItem) {
  if (event.isAllDay) return "All day"

  const start = parseEventInstant(event.start, false)
  const end = parseEventInstant(event.end, false)
  const formatter = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  })

  return `${formatter.format(start)} – ${formatter.format(end)}`
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase()
}

type DetailFieldProps = {
  icon: React.ComponentType<{ className?: string }>
  label: string
  children: React.ReactNode
}

function DetailField({ icon: Icon, label, children }: DetailFieldProps) {
  return (
    <div className="flex gap-3 rounded-xl border border-border/70 bg-muted/20 p-3.5">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-background shadow-sm ring-1 ring-border/60">
        <Icon className="size-4 text-warm-muted" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <div className="mt-1 text-sm leading-relaxed text-foreground">{children}</div>
      </div>
    </div>
  )
}

type CalendarEventDetailDialogProps = {
  event: CalendarEventItem
}

export function CalendarEventDetailDialog({
  event,
}: CalendarEventDetailDialogProps) {
  const dateHeading = formatEventDateHeading(event.start, event.isAllDay)
  const timeRange = formatEventTimeRange(event)

  return (
    <div className="flex max-h-[min(85vh,680px)] min-h-0 flex-col overflow-hidden">
      <div className="relative border-b border-border/70 bg-linear-to-br from-warm/25 via-card to-card px-6 pt-6 pb-5 pr-14">
        <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-warm-muted via-primary/70 to-warm-muted/60" />
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Badge
            variant="secondary"
            className="gap-1 bg-background/80 text-[11px] font-medium"
          >
            <CalendarDays className="size-3" />
            Event
          </Badge>
          {event.isAllDay ? (
            <Badge variant="outline" className="text-[11px]">
              All day
            </Badge>
          ) : null}
          {event.attendees.length > 0 ? (
            <Badge variant="outline" className="gap-1 text-[11px]">
              <Users className="size-3" />
              {event.attendees.length} attendee
              {event.attendees.length === 1 ? "" : "s"}
            </Badge>
          ) : null}
        </div>
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          {event.title}
        </h2>
        <p className="mt-2 text-sm font-medium text-foreground/85">
          {dateHeading}
        </p>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div className="space-y-3 p-5">
          <DetailField icon={Clock} label="Time">
            {timeRange}
          </DetailField>

          {event.location ? (
            <DetailField icon={MapPin} label="Location">
              {event.location}
            </DetailField>
          ) : null}

          {event.attendees.length > 0 ? (
            <div className="rounded-xl border border-border/70 bg-muted/20 p-3.5">
              <div className="mb-3 flex items-center gap-2">
                <Users className="size-4 text-warm-muted" />
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Attendees
                </p>
              </div>
              <ul className="space-y-2">
                {event.attendees.map((attendee) => {
                  const label = attendee.displayName ?? attendee.email
                  return (
                    <li
                      key={attendee.email}
                      className="flex items-center gap-3 rounded-lg bg-background/70 px-3 py-2 ring-1 ring-border/50"
                    >
                      <Avatar className="size-8">
                        <AvatarFallback className="bg-warm/30 text-xs font-medium text-foreground">
                          {getInitials(label)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {attendee.displayName ?? attendee.email}
                        </p>
                        {attendee.displayName ? (
                          <p className="truncate text-xs text-muted-foreground">
                            {attendee.email}
                          </p>
                        ) : null}
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
          ) : null}

          {event.description ? (
            <>
              <Separator className="bg-border/70" />
              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Description
                </p>
                <div className="rounded-xl border border-border/70 bg-muted/15 px-4 py-3">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                    {event.description}
                  </p>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </ScrollArea>

      {(event.hangoutLink || event.htmlLink) && (
        <div
          className={cn(
            "flex flex-wrap gap-2 border-t border-border/70 bg-muted/25 px-5 py-4",
          )}
        >
          {event.hangoutLink ? (
            <Button size="sm" asChild className="rounded-full">
              <a href={event.hangoutLink} target="_blank" rel="noreferrer">
                <Video className="size-4" />
                Join meeting
              </a>
            </Button>
          ) : null}
          {event.htmlLink ? (
            <Button variant="outline" size="sm" asChild className="rounded-full">
              <a href={event.htmlLink} target="_blank" rel="noreferrer">
                <ExternalLink className="size-4" />
                Open in Google Calendar
              </a>
            </Button>
          ) : null}
        </div>
      )}
    </div>
  )
}
