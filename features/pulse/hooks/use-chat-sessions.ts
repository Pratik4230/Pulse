import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import type { ChatSessionListItem } from "@/features/pulse/types/chat"

export const chatSessionsQueryKey = ["chat-sessions"] as const

async function fetchChatSessions() {
  const response = await fetch("/api/chat/sessions")
  if (!response.ok) {
    throw new Error("Failed to load chat sessions")
  }
  const data = (await response.json()) as { sessions: ChatSessionListItem[] }
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
      if (!response.ok) {
        throw new Error("Failed to delete chat")
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatSessionsQueryKey })
    },
  })
}
