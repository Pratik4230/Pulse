import {
  useInfiniteQuery,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query"
import { useEffect, useMemo, useRef } from "react"

import type { InboxFilter, InboxListItem, InboxListPage } from "../types"

async function fetchInboxPage(
  filter: InboxFilter,
  query: string,
  pageToken?: string,
) {
  const params = new URLSearchParams({ filter })
  if (query) params.set("q", query)
  if (pageToken) params.set("pageToken", pageToken)

  const response = await fetch(`/api/inbox/messages?${params}`)

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as {
      error?: string
      code?: string
    } | null
    const error = new Error(data?.error ?? "Failed to load inbox")
    ;(error as Error & { code?: string }).code = data?.code
    throw error
  }

  return response.json() as Promise<InboxListPage>
}

async function fetchEnrichedMessages(ids: string[], filter: InboxFilter) {
  const response = await fetch("/api/inbox/messages/enrich", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids, filter }),
  })

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as {
      error?: string
    } | null
    throw new Error(data?.error ?? "Failed to enrich inbox messages")
  }

  return response.json() as Promise<{ messages: InboxListItem[] }>
}

function mergeEnrichedItem(
  existing: InboxListItem,
  enriched: InboxListItem,
): InboxListItem {
  if (!enriched.enriched) return existing

  return {
    ...enriched,
    snippet: enriched.snippet || existing.snippet,
    isUnread: enriched.isUnread || existing.isUnread,
    date: enriched.date || existing.date,
    enriched: true,
  }
}

function mergeEnrichedIntoPages(
  data: InfiniteData<InboxListPage>,
  enriched: InboxListItem[],
): InfiniteData<InboxListPage> {
  const enrichedById = new Map(enriched.map((item) => [item.id, item]))

  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      messages: page.messages.map((message) => {
        const detail = enrichedById.get(message.id)
        return detail ? mergeEnrichedItem(message, detail) : message
      }),
    })),
  }
}

export function inboxMessagesQueryKey(filter: InboxFilter, query = "") {
  return ["inbox", "messages", filter, query] as const
}

export function useInboxMessages(
  filter: InboxFilter,
  enabled = true,
  query = "",
) {
  const queryClient = useQueryClient()
  const enrichingIdsRef = useRef(new Set<string>())

  const infinite = useInfiniteQuery({
    queryKey: inboxMessagesQueryKey(filter, query),
    queryFn: ({ pageParam }) => fetchInboxPage(filter, query, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextPageToken ?? undefined,
    enabled,
    staleTime: 60_000,
  })

  const messages = useMemo(
    () => infinite.data?.pages.flatMap((page) => page.messages) ?? [],
    [infinite.data?.pages],
  )

  const unenrichedIds = useMemo(
    () =>
      messages
        .filter((message) => !message.enriched)
        .map((message) => message.id),
    [messages],
  )

  const unenrichedKey = unenrichedIds.join(",")

  useEffect(() => {
    if (!enabled || !unenrichedKey) return

    const ids = unenrichedKey.split(",")
    const pendingIds = ids.filter((id) => !enrichingIdsRef.current.has(id))
    if (pendingIds.length === 0) return

    for (const id of pendingIds) {
      enrichingIdsRef.current.add(id)
    }

    let cancelled = false

    void fetchEnrichedMessages(pendingIds, filter)
      .then(({ messages: enriched }) => {
        if (cancelled || enriched.length === 0) return

        queryClient.setQueryData<InfiniteData<InboxListPage>>(
          inboxMessagesQueryKey(filter, query),
          (current) =>
            current ? mergeEnrichedIntoPages(current, enriched) : current,
        )
      })
      .catch(() => {
        for (const id of pendingIds) {
          enrichingIdsRef.current.delete(id)
        }
      })
      .finally(() => {
        for (const id of pendingIds) {
          enrichingIdsRef.current.delete(id)
        }
      })

    return () => {
      cancelled = true
    }
  }, [enabled, filter, query, queryClient, unenrichedKey])

  return {
    messages,
    isLoading: infinite.isLoading,
    isError: infinite.isError,
    isFetching: infinite.isFetching,
    isFetchingNextPage: infinite.isFetchingNextPage,
    hasNextPage: infinite.hasNextPage,
    fetchNextPage: infinite.fetchNextPage,
    refetch: infinite.refetch,
  }
}
