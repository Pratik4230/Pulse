import { useQuery } from "@tanstack/react-query"

import type { InboxThreadDetail } from "../types"
import { fetchJson } from "@/lib/api-client"

async function fetchInboxThread(id: string) {
  return fetchJson<{ thread: InboxThreadDetail }>(`/api/inbox/messages/${id}`)
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
