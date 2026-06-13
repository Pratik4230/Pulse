"use client"

import { useEffect, useRef } from "react"

import { RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

import type { InboxListItem } from "../types"
import { InboxListItemRow } from "./inbox-list-item"

type InboxListProps = {
  messages: InboxListItem[] | undefined
  isLoading: boolean
  isError: boolean
  selectedId: string | null
  onSelect: (id: string) => void
  onRefresh: () => void
  isRefreshing: boolean
  hasNextPage?: boolean
  isFetchingNextPage?: boolean
  onLoadMore?: () => void
}

function InboxListSkeleton() {
  return (
    <div className="space-y-0">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="space-y-2 border-b border-border/60 px-4 py-3.5"
        >
          <div className="flex justify-between gap-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-12" />
          </div>
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-full" />
        </div>
      ))}
    </div>
  )
}

export function InboxList({
  messages,
  isLoading,
  isError,
  selectedId,
  onSelect,
  onRefresh,
  isRefreshing,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}: InboxListProps) {
  const loadMoreRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = loadMoreRef.current
    if (!node || !hasNextPage || !onLoadMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isFetchingNextPage) {
          onLoadMore()
        }
      },
      { rootMargin: "120px" },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, onLoadMore])

  if (isLoading) {
    return <InboxListSkeleton />
  }

  if (isError) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Could not load your inbox.
        </p>
        <Button variant="outline" size="sm" onClick={onRefresh}>
          <RefreshCw className={cn("size-4", isRefreshing && "animate-spin")} />
          Try again
        </Button>
      </div>
    )
  }

  if (!messages?.length) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
        <p className="text-sm font-medium text-foreground">Inbox is empty</p>
        <p className="mt-1 text-xs text-muted-foreground">
          No messages match this view.
        </p>
      </div>
    )
  }

  return (
    <ScrollArea className="h-full [&_[data-slot=scroll-area-viewport]>div]:!block [&_[data-slot=scroll-area-viewport]>div]:!w-full [&_[data-slot=scroll-area-viewport]>div]:!min-w-0">
      <div className="w-full min-w-0">
        {messages.map((item) => (
          <InboxListItemRow
            key={item.id}
            item={item}
            isActive={item.id === selectedId}
            onSelect={onSelect}
          />
        ))}

        <div ref={loadMoreRef} className="flex justify-center py-4">
          {isFetchingNextPage ? (
            <Spinner className="size-5 text-muted-foreground" />
          ) : hasNextPage ? (
            <span className="text-xs text-muted-foreground">Scroll for more</span>
          ) : messages.length > 0 ? (
            <span className="text-xs text-muted-foreground">End of inbox</span>
          ) : null}
        </div>
      </div>
    </ScrollArea>
  )
}
