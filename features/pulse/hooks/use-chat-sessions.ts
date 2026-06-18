import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import type { ChatSessionListItem } from "@/features/pulse/types/chat"
import { assertOkResponse, fetchJson } from "@/lib/api-client"

export const chatSessionsQueryKey = ["chat-sessions"] as const

async function fetchChatSessions() {
  const data = await fetchJson<{ sessions: ChatSessionListItem[] }>(
    "/api/chat/sessions",
  )
  return data.sessions
}

export function useChatSessions() {
  return useQuery({
    queryKey: chatSessionsQueryKey,
    queryFn: fetchChatSessions,
  })
}

export function useDeleteChatSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await fetch(`/api/chat/sessions/${sessionId}`, {
        method: "DELETE",
      })
      await assertOkResponse(response)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatSessionsQueryKey })
    },
  })
}
