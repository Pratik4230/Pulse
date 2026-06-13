"use client"

import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

import type { InboxListItem } from "../types"

type InboxListItemRowProps = {
  item: InboxListItem
  isActive: boolean
  onSelect: (id: string) => void
}

export function InboxListItemRow({
  item,
  isActive,
  onSelect,
}: InboxListItemRowProps) {
  const sender = item.from || "Unknown sender"
  const displaySubject =
    item.subject && item.subject !== "(No subject)"
      ? item.subject
      : item.snippet
        ? item.snippet.slice(0, 80)
        : "(No subject)"
  const showSnippetPreview =
    Boolean(item.snippet) &&
    Boolean(item.subject && item.subject !== "(No subject)")

  const isEnriching = !item.enriched

  return (
    <button
      type="button"
      onClick={() => onSelect(item.id)}
      className={cn(
        "relative w-full min-w-0 overflow-hidden border-b border-border/60 px-4 py-3.5 pr-3 text-left transition-colors",
        "hover:bg-accent/40",
        isActive && "bg-accent/50",
      )}
    >
      {isActive ? (
        <span className="absolute inset-y-0 left-0 w-0.5 bg-warm-muted" />
      ) : null}
      {item.isUnread ? (
        <span className="absolute left-1.5 top-5 size-1.5 rounded-full bg-primary" />
      ) : null}

      <div className="flex min-w-0 items-start justify-between gap-2 pl-2">
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-baseline justify-between gap-2">
            {isEnriching ? (
              <Skeleton className="h-4 w-28" />
            ) : (
              <p
                className={cn(
                  "min-w-0 flex-1 truncate text-sm",
                  item.isUnread
                    ? "font-semibold text-foreground"
                    : "font-medium text-foreground/90",
                )}
              >
                {sender}
              </p>
            )}
            {item.date ? (
              <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                {item.date}
              </span>
            ) : isEnriching ? (
              <Skeleton className="h-3 w-12" />
            ) : null}
          </div>
          {isEnriching ? (
            <Skeleton className="mt-0.5 h-4 w-3/4" />
          ) : (
            <p
              className={cn(
                "mt-0.5 min-w-0 truncate text-sm",
                item.isUnread
                  ? "font-medium text-foreground"
                  : "text-foreground/80",
              )}
            >
              {displaySubject}
            </p>
          )}
          {showSnippetPreview ? (
            <p className="mt-1 line-clamp-2 min-w-0 text-xs leading-relaxed wrap-break-word text-muted-foreground">
              {item.snippet}
            </p>
          ) : null}
        </div>
      </div>
    </button>
  )
}
