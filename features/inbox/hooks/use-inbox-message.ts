import { useQuery } from "@tanstack/react-query"

import type { InboxThreadDetail } from "../types"

async function fetchInboxThread(id: string) {
  const response = await fetch(`/api/inbox/messages/${id}`)

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as {
      error?: string
    } | null
    throw new Error(data?.error ?? "Failed to load message")
  }

  return response.json() as Promise<{ thread: InboxThreadDetail }>
}

export function inboxThreadQueryKey(id: string) {
  return ["inbox", "thread", id] as const
}

export function useInboxMessage(id: string | null) {
  return useQuery({
    queryKey: inboxThreadQueryKey(id ?? ""),
    queryFn: () => fetchInboxThread(id!),
    enabled: Boolean(id),
    select: (data) => data.thread,
  })
}
