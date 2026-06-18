"use client"

import { RefreshCw, Search, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

import type { InboxFilter } from "../types"

export const INBOX_SEARCH_INPUT_ID = "inbox-search-input"

type InboxToolbarProps = {
  filter: InboxFilter
  search: string
  onSearchChange: (value: string) => void
  onFilterChange: (filter: InboxFilter) => void
  onRefresh: () => void
  isRefreshing: boolean
  messageCount?: number
}

export function InboxToolbar({
  filter,
  search,
  onSearchChange,
  onFilterChange,
  onRefresh,
  isRefreshing,
  messageCount,
}: InboxToolbarProps) {
  return (
    <div className="border-b border-border/80 bg-card/60">
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-3">
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
            <Kbd>/</Kbd>
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

      <div className="px-4 pb-3">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id={INBOX_SEARCH_INPUT_ID}
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search inbox…"
            maxLength={200}
            className="h-9 bg-background/80 pr-9 pl-9"
          />
          {search ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="absolute top-1/2 right-1 -translate-y-1/2"
              aria-label="Clear search"
              onClick={() => onSearchChange("")}
            >
              <X className="size-3.5" />
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
