"use client"

import { ArrowLeft } from "lucide-react"
import { useCallback, useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { useIntegrationsStatus } from "@/features/integrations/core/hooks/use-integrations-status"
import { cn } from "@/lib/utils"

import { useInboxMessage } from "../hooks/use-inbox-message"
import { useInboxMessages } from "../hooks/use-inbox-messages"
import type { InboxFilter } from "../types"
import { InboxConnectPrompt } from "./inbox-connect-prompt"
import { InboxList } from "./inbox-list"
import { InboxPreview } from "./inbox-preview"
import { InboxToolbar } from "./inbox-toolbar"

export function InboxWorkspace() {
  const [filter, setFilter] = useState<InboxFilter>("all")
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const { data: statusData, isLoading: isStatusLoading } =
    useIntegrationsStatus()
  const gmailConnected = statusData?.integrations.gmail === "connected"
  const inboxEnabled = statusData?.integrations.gmail !== "not_connected"

  const {
    messages,
    isLoading: isListLoading,
    isError: isListError,
    isFetching: isListFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch: refetchList,
  } = useInboxMessages(filter, inboxEnabled)

  const displaySelectedId = useMemo(() => {
    if (!messages?.length) return null
    if (selectedId && messages.some((message) => message.id === selectedId)) {
      return selectedId
    }
    return messages[0].id
  }, [messages, selectedId])

  const previewMessageId = selectedId ?? displaySelectedId

  const {
    data: thread,
    isLoading: isMessageLoading,
    isFetching: isMessageFetching,
  } = useInboxMessage(gmailConnected ? previewMessageId : null)

  const handleFilterChange = useCallback((next: InboxFilter) => {
    setFilter(next)
    setSelectedId(null)
  }, [])

  const handleRefresh = useCallback(() => {
    void refetchList()
  }, [refetchList])

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage()
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  if (isStatusLoading && !messages?.length && isListLoading) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
        Loading inbox…
      </div>
    )
  }

  if (!gmailConnected && !isStatusLoading) {
    return <InboxConnectPrompt />
  }

  return (
    <div className="flex h-full min-h-0 flex-1 overflow-hidden">
      <section
        className={cn(
          "flex min-h-0 w-full min-w-0 flex-col border-border/80 bg-card/40 md:w-[min(42%,22rem)] md:max-w-sm md:border-r",
          selectedId ? "hidden md:flex" : "flex",
        )}
      >
        <InboxToolbar
          filter={filter}
          onFilterChange={handleFilterChange}
          onRefresh={handleRefresh}
          isRefreshing={isListFetching}
          messageCount={messages?.length}
        />
        <div className="min-h-0 flex-1">
          <InboxList
            messages={messages}
            isLoading={isListLoading}
            isError={isListError}
            selectedId={displaySelectedId}
            onSelect={setSelectedId}
            onRefresh={handleRefresh}
            isRefreshing={isListFetching}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            onLoadMore={handleLoadMore}
          />
        </div>
      </section>

      <section
        className={cn(
          "flex min-h-0 min-w-0 flex-1 flex-col bg-background",
          selectedId ? "flex" : "hidden md:flex",
        )}
      >
        {selectedId ? (
          <div className="flex items-center border-b border-border/80 px-3 py-2 md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedId(null)}
            >
              <ArrowLeft className="size-4" />
              Back
            </Button>
          </div>
        ) : null}
        <div className="min-h-0 flex-1">
          <InboxPreview
            thread={thread}
            isLoading={isMessageLoading || isMessageFetching}
            hasSelection={Boolean(previewMessageId)}
          />
        </div>
      </section>
    </div>
  )
}
