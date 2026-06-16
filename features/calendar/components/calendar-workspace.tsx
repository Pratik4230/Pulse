"use client"

import { Plus, RefreshCw } from "lucide-react"
import { useCallback, useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet"
import { useIntegrationsStatus } from "@/features/integrations/core/hooks/use-integrations-status"
import { cn } from "@/lib/utils"

import { useCalendarEvents } from "../hooks/use-calendar-events"
import { CalendarConnectPrompt } from "./calendar-connect-prompt"
import { CalendarCreateDialog } from "./calendar-create-dialog"
import { CalendarEventDetail, CalendarEventList } from "./calendar-event-list"

export function CalendarWorkspace() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)

  const { data: statusData, isLoading: isStatusLoading } =
    useIntegrationsStatus()
  const calendarConnected =
    statusData?.integrations.googlecalendar === "connected"

  const {
    data,
    isLoading,
    isError,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useCalendarEvents(undefined, calendarConnected)

  const events = data?.events

  const displaySelectedId = useMemo(() => {
    if (!events?.length) return null
    if (selectedId && events.some((event) => event.id === selectedId)) {
      return selectedId
    }
    return events[0].id
  }, [events, selectedId])

  const selectedEvent = useMemo(
    () => events?.find((event) => event.id === displaySelectedId) ?? null,
    [events, displaySelectedId],
  )

  const handleRefresh = useCallback(() => {
    void refetch()
  }, [refetch])

  const handleSelectEvent = useCallback((eventId: string) => {
    setSelectedId(eventId)
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setMobileDetailOpen(true)
    }
  }, [])

  if (isStatusLoading && !events?.length && isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
        Loading calendar…
      </div>
    )
  }

  if (!calendarConnected && !isStatusLoading) {
    return <CalendarConnectPrompt />
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-border/80 bg-card/60 px-4 py-3">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Calendar
          </h2>
          <p className="text-sm text-foreground">All upcoming events</p>
        </div>

        <div className="flex items-center gap-2">
          {events ? (
            <span className="text-xs text-muted-foreground">
              {events.length} event{events.length === 1 ? "" : "s"}
            </span>
          ) : null}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleRefresh}
            aria-label="Refresh calendar"
          >
            <RefreshCw
              className={cn("size-4", isFetching && "animate-spin")}
            />
          </Button>
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            Create event
          </Button>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="min-h-0 border-b border-border/80 lg:border-b-0 lg:border-r">
          <CalendarEventList
            events={events}
            isLoading={isLoading}
            isError={isError}
            selectedId={displaySelectedId}
            onSelect={handleSelectEvent}
            hasNextPage={Boolean(hasNextPage)}
            isFetchingNextPage={isFetchingNextPage}
            onLoadMore={() => void fetchNextPage()}
          />
        </div>
        <div className="hidden min-h-0 lg:flex">
          <CalendarEventDetail event={selectedEvent} />
        </div>
      </div>

      <Sheet
        open={mobileDetailOpen && Boolean(selectedEvent)}
        onOpenChange={setMobileDetailOpen}
      >
        <SheetContent
          side="bottom"
          className="h-[85vh] rounded-t-2xl p-0 lg:hidden"
        >
          <SheetTitle className="sr-only">Calendar event details</SheetTitle>
          <SheetDescription className="sr-only">
            View selected event information including time, location, attendees,
            and description.
          </SheetDescription>
          <CalendarEventDetail event={selectedEvent} />
        </SheetContent>
      </Sheet>

      <CalendarCreateDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}
