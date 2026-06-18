"use client"

import { ChevronLeft, ChevronRight, Plus, RefreshCw } from "lucide-react"
import { useCallback, useMemo, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useIntegrationsStatus } from "@/features/integrations/core/hooks/use-integrations-status"
import { cn } from "@/lib/utils"

import { useCalendarEvents } from "../hooks/use-calendar-events"
import { useCalendarWeeks } from "../hooks/use-calendar-weeks"
import { CalendarConnectPrompt } from "./calendar-connect-prompt"
import { CalendarCreateDialog } from "./calendar-create-dialog"
import { CalendarEventList } from "./calendar-event-list"
import { CalendarEventDetailDialog } from "./calendar-event-detail-dialog"
import {
  CalendarWeekScroller,
  type CalendarWeekScrollerHandle,
} from "./calendar-week-scroller"

type CalendarView = "week" | "agenda"

export function CalendarWorkspace() {
  const [view, setView] = useState<CalendarView>("week")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const weekScrollerRef = useRef<CalendarWeekScrollerHandle>(null)

  const { data: statusData, isLoading: isStatusLoading } =
    useIntegrationsStatus()
  const calendarConnected =
    statusData?.integrations.googlecalendar === "connected"

  const weekState = useCalendarWeeks(calendarConnected && view === "week")

  const agendaQuery = useCalendarEvents(
    undefined,
    calendarConnected && view === "agenda",
  )

  const {
    data: agendaData,
    isLoading: isAgendaLoading,
    isError: isAgendaError,
    isFetching: isAgendaFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch: refetchAgenda,
  } = agendaQuery

  const agendaEvents = agendaData?.events

  const selectedEvent = useMemo(() => {
    if (!selectedId) return null
    const pool = view === "agenda" ? agendaEvents : weekState.allEvents
    return pool?.find((event) => event.id === selectedId) ?? null
  }, [agendaEvents, selectedId, view, weekState.allEvents])

  const handleRefresh = useCallback(() => {
    if (view === "agenda") {
      void refetchAgenda()
    }
  }, [refetchAgenda, view])

  const handleSelectEvent = useCallback((eventId: string) => {
    setSelectedId(eventId)
  }, [])

  const handleDetailOpenChange = useCallback((open: boolean) => {
    if (!open) setSelectedId(null)
  }, [])

  const handleViewChange = useCallback((next: string) => {
    setView(next as CalendarView)
    setSelectedId(null)
  }, [])

  const handleScrollToToday = useCallback(() => {
    weekScrollerRef.current?.scrollToToday()
  }, [])

  const handleScrollWeek = useCallback((direction: -1 | 1) => {
    weekScrollerRef.current?.scrollByWeek(direction)
  }, [])

  if (
    isStatusLoading &&
    view === "agenda" &&
    !agendaEvents?.length &&
    isAgendaLoading
  ) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
        Loading calendar...
      </div>
    )
  }

  if (!calendarConnected && !isStatusLoading) {
    return <CalendarConnectPrompt />
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 bg-card/60 px-4 py-3">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Calendar
            </h2>
            <Tabs value={view} onValueChange={handleViewChange}>
              <TabsList className="h-8">
                <TabsTrigger value="week" className="px-3 text-xs">
                  Week
                </TabsTrigger>
                <TabsTrigger value="agenda" className="px-3 text-xs">
                  Agenda
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <p className="text-sm text-foreground">
            {view === "week"
              ? "Scroll horizontally for more weeks"
              : "All upcoming events"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {view === "week" ? (
            <>
              <Button
                variant="outline"
                size="icon-sm"
                aria-label="Previous week"
                onClick={() => handleScrollWeek(-1)}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleScrollToToday}>
                Today
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                aria-label="Next week"
                onClick={() => handleScrollWeek(1)}
              >
                <ChevronRight className="size-4" />
              </Button>
            </>
          ) : null}
          {view === "agenda" && agendaEvents ? (
            <span className="text-xs text-muted-foreground">
              {agendaEvents.length} event{agendaEvents.length === 1 ? "" : "s"}
            </span>
          ) : null}
          {view === "agenda" ? (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleRefresh}
              aria-label="Refresh calendar"
            >
              <RefreshCw
                className={cn("size-4", isAgendaFetching && "animate-spin")}
              />
            </Button>
          ) : null}
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            Create event
          </Button>
        </div>
      </div>

      <div className="min-h-0 flex-1">
        {view === "week" ? (
          <CalendarWeekScroller
            ref={weekScrollerRef}
            weeks={weekState.weeks}
            isFetchingMore={weekState.isFetchingMore}
            isInitialLoading={weekState.isInitialLoading}
            onLoadMore={weekState.loadMoreWeeks}
            selectedId={selectedId}
            onSelect={handleSelectEvent}
          />
        ) : (
          <CalendarEventList
            events={agendaEvents}
            isLoading={isAgendaLoading}
            isError={isAgendaError}
            selectedId={selectedId}
            onSelect={handleSelectEvent}
            hasNextPage={Boolean(hasNextPage)}
            isFetchingNextPage={isFetchingNextPage}
            onLoadMore={() => void fetchNextPage()}
          />
        )}
      </div>

      <Dialog
        open={Boolean(selectedEvent)}
        onOpenChange={handleDetailOpenChange}
      >
        <DialogContent className="flex max-h-[min(85vh,680px)] max-w-md flex-col gap-0 overflow-hidden p-0 sm:max-w-md">
          <DialogTitle className="sr-only">
            {selectedEvent?.title ?? "Calendar event details"}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Event time, location, attendees, and description.
          </DialogDescription>
          {selectedEvent ? (
            <CalendarEventDetailDialog event={selectedEvent} />
          ) : null}
        </DialogContent>
      </Dialog>

      <CalendarCreateDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}
