"use client"

import { cn } from "@/lib/utils"

import type { InboxMessageDetail } from "../types"
import { InboxEmailBody } from "./inbox-email-body"

type InboxThreadMessageProps = {
  message: InboxMessageDetail
  isFocused: boolean
}

export function InboxThreadMessage({
  message,
  isFocused,
}: InboxThreadMessageProps) {
  return (
    <article className="space-y-3">
      <header className="flex items-start justify-between gap-3 px-0.5">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">
            {message.from}
          </p>
          {message.to ? (
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              to {message.to}
            </p>
          ) : null}
        </div>
        {message.date ? (
          <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
            {message.date}
          </span>
        ) : null}
      </header>

      <div
        className={cn(
          "overflow-hidden rounded-lg border border-border/50 bg-white shadow-sm",
          isFocused && "ring-2 ring-warm-muted/30",
        )}
      >
        <InboxEmailBody
          bodyHtml={message.bodyHtml}
          bodyText={message.body || message.snippet}
        />
      </div>
    </article>
  )
}
