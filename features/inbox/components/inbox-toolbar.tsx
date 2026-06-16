"use client"

import { RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

import type { InboxFilter } from "../types"

type InboxToolbarProps = {
  filter: InboxFilter
  onFilterChange: (filter: InboxFilter) => void
  onRefresh: () => void
  isRefreshing: boolean
  messageCount?: number
}

export function InboxToolbar({
  filter,
  onFilterChange,
  onRefresh,
  isRefreshing,
  messageCount,
}: InboxToolbarProps) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/80 bg-card/60 px-4 py-3">
      <div className="flex items-center gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Inbox
        </h2>
        <Tabs
          value={filter}
          onValueChange={(value) => onFilterChange(value as InboxFilter)}
        >
          <TabsList variant="line" className="h-8 bg-transparent p-0">
            <TabsTrigger value="all" className="px-2 text-xs">
              All
            </TabsTrigger>
            <TabsTrigger value="unread" className="px-2 text-xs">
              Unread
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex items-center gap-2">
        <KbdGroup className="hidden text-[11px] text-muted-foreground md:inline-flex">
          <Kbd>↑</Kbd>
          <Kbd>↓</Kbd>
          <Kbd>R</Kbd>
        </KbdGroup>
        {messageCount !== undefined ? (
          <span className="text-xs text-muted-foreground">
            {messageCount} message{messageCount === 1 ? "" : "s"}
          </span>
        ) : null}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onRefresh}
          aria-label="Refresh inbox"
        >
          <RefreshCw
            className={cn("size-4", isRefreshing && "animate-spin")}
          />
        </Button>
      </div>
    </div>
  )
}
