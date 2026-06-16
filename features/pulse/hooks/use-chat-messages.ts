import { useQuery } from "@tanstack/react-query"
import type { UIMessage } from "ai"

import type { ChatMessagesPage } from "@/features/pulse/types/chat"

export function chatMessagesQueryKey(sessionId: string) {
  return ["chat-messages", sessionId] as const
}

async function fetchChatMessagesPage(
  sessionId: string,
  beforeSequence?: number,
) {
  const params = new URLSearchParams()
  if (beforeSequence != null) {
    params.set("before", String(beforeSequence))
  }

  const query = params.toString()
  const response = await fetch(
    `/api/chat/sessions/${sessionId}/messages${query ? `?${query}` : ""}`,
  )

  if (!response.ok) {
    throw new Error("Failed to load chat messages")
  }

  return response.json() as Promise<ChatMessagesPage>
}

export function useChatMessages(sessionId: string | null) {
  return useQuery({
    queryKey: sessionId
      ? chatMessagesQueryKey(sessionId)
      : ["chat-messages", "none"],
    enabled: Boolean(sessionId),
    queryFn: () => fetchChatMessagesPage(sessionId!),
  })
}

export async function fetchOlderChatMessages(
  sessionId: string,
  beforeSequence: number,
): Promise<ChatMessagesPage> {
  return fetchChatMessagesPage(sessionId, beforeSequence)
}

export type { UIMessage }
