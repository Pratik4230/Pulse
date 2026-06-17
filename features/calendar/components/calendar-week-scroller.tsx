"use client"

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react"

import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

import type { CalendarWeekSlice } from "../hooks/use-calendar-weeks"
import { formatDateKey, formatWeekRangeLabel } from "../lib/week"
import { CalendarWeekGrid } from "./calendar-week-grid"

type CalendarWeekScrollerProps = {
  weeks: CalendarWeekSlice[]
  isFetchingMore: boolean
  isInitialLoading: boolean
  onLoadMore: () => void
  selectedId: string | null
  onSelect: (id: string) => void
}

export type CalendarWeekScrollerHandle = {
  scrollToToday: () => void
  scrollByWeek: (direction: -1 | 1) => void
}

export const CalendarWeekScroller = forwardRef<
  CalendarWeekScrollerHandle,
  CalendarWeekScrollerProps
>(function CalendarWeekScroller(
  {
    weeks,
    isFetchingMore,
    isInitialLoading,
    onLoadMore,
    selectedId,
    onSelect,
  },
  ref,
) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const loadingMoreRef = useRef(false)
  const [pageWidth, setPageWidth] = useState(0)

  useImperativeHandle(ref, () => ({
    scrollToToday() {
      const container = scrollRef.current
      if (!container) return
      container.scrollTo({ left: 0, behavior: "smooth" })
    },
    scrollByWeek(direction) {
      const container = scrollRef.current
      if (!container) return
      const width = container.clientWidth
      container.scrollBy({ left: direction * width, behavior: "smooth" })
    },
  }))

  useEffect(() => {
    const node = scrollRef.current
    if (!node) return

    const updateWidth = () => setPageWidth(node.clientWidth)
    updateWidth()

    const observer = new ResizeObserver(updateWidth)
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    loadingMoreRef.current = isFetchingMore
  }, [isFetchingMore])

  useEffect(() => {
    const root = scrollRef.current
    const sentinel = sentinelRef.current
    if (!root || !sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !loadingMoreRef.current) {
          onLoadMore()
        }
      },
      { root, rootMargin: "120px", threshold: 0 },
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [onLoadMore, weeks.length])

  if (isInitialLoading && weeks.every((week) => week.events.length === 0)) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner className="size-5 text-muted-foreground" />
      </div>
    )
  }

  return (
    <div
      ref={scrollRef}
      className="h-full min-h-0 snap-x snap-mandatory overflow-x-auto overflow-y-hidden scroll-smooth"
    >
      <div className="flex h-full min-h-0 items-stretch">
        {weeks.map((week) => {
          const weekKey = formatDateKey(week.start)

          return (
            <section
              key={weekKey}
              aria-label={formatWeekRangeLabel(week.start)}
              style={pageWidth > 0 ? { width: pageWidth } : undefined}
              className={cn(
                "flex h-full min-h-0 shrink-0 snap-center flex-col border-r border-border/60",
                pageWidth === 0 && "w-full",
                "[content-visibility:auto] [contain-intrinsic-size:0_520px]",
              )}
            >
              <div className="border-b border-border/70 px-4 py-2 text-xs font-medium text-muted-foreground">
                {formatWeekRangeLabel(week.start)}
              </div>
              <div className="min-h-0 flex-1">
                <CalendarWeekGrid
                  weekStart={week.start}
                  events={week.events}
                  selectedId={selectedId}
                  onSelect={onSelect}
                  isLoading={week.isLoading}
                />
              </div>
            </section>
          )
        })}

        <div
          ref={sentinelRef}
          aria-hidden
          className="flex w-16 shrink-0 snap-center items-center justify-center"
        >
          {isFetchingMore ? (
            <Spinner className="size-5 text-muted-foreground" />
          ) : null}
        </div>
      </div>
    </div>
  )
})
