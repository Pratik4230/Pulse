"use client"

import { useCallback, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { AppShell } from "@/features/pulse/components/app-shell"
import { PulseChat } from "@/features/pulse/components/pulse-chat"
import {
  chatSessionsQueryKey,
  useChatSessions,
} from "@/features/pulse/hooks/use-chat-sessions"
import {
  chatMessagesQueryKey,
  useChatMessages,
} from "@/features/pulse/hooks/use-chat-messages"

export function PulseWorkspace() {
  const queryClient = useQueryClient()
  const { data: sessions = [] } = useChatSessions()
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [draftKey, setDraftKey] = useState(0)
  const [chatInstanceKey, setChatInstanceKey] = useState("draft-0")
  const [loadedSessionId, setLoadedSessionId] = useState<string | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)

  const shouldLoadMessages =
    loadedSessionId != null && activeSessionId === loadedSessionId

  const { data: messagesPage, isLoading: isLoadingMessages } =
    useChatMessages(shouldLoadMessages ? loadedSessionId : null)

  const activeTitle =
    activeSessionId == null
      ? "New chat"
      : (sessions.find((session) => session.id === activeSessionId)?.title ??
        "New chat")

  const guardSwitch = useCallback(() => {
    if (isStreaming) {
      toast.message("Wait for Pulse to finish the current reply")
      return false
    }
    return true
  }, [isStreaming])

  const handleNewChat = useCallback(() => {
    if (!guardSwitch()) return
    const nextDraftKey = draftKey + 1
    setActiveSessionId(null)
    setLoadedSessionId(null)
    setDraftKey(nextDraftKey)
    setChatInstanceKey(`draft-${nextDraftKey}`)
  }, [draftKey, guardSwitch])

  const handleSelectSession = useCallback(
    (id: string) => {
      if (!guardSwitch()) return
      setActiveSessionId(id)
      setLoadedSessionId(id)
      setChatInstanceKey(id)
    },
    [guardSwitch],
  )

  const handleSessionCreated = useCallback(
    (sessionId: string, title: string) => {
      setActiveSessionId(sessionId)
      queryClient.setQueryData(
        chatSessionsQueryKey,
        (
          current:
            | {
                id: string
                title: string
                messageCount: number
                updatedAt: string
                createdAt: string
              }[]
            | undefined,
        ) => {
          const now = new Date().toISOString()
          const next = {
            id: sessionId,
            title: title || "New chat",
            messageCount: 0,
            updatedAt: now,
            createdAt: now,
          }

          if (!current) return [next]
          if (current.some((session) => session.id === sessionId)) {
            return current
          }
          return [next, ...current]
        },
      )
      void queryClient.invalidateQueries({ queryKey: chatSessionsQueryKey })
    },
    [queryClient],
  )

  const handleConversationSaved = useCallback(
    (sessionId: string) => {
      void queryClient.invalidateQueries({
        queryKey: chatMessagesQueryKey(sessionId),
      })
      void queryClient.invalidateQueries({ queryKey: chatSessionsQueryKey })
    },
    [queryClient],
  )

  const handleDeleteSession = useCallback(
    (sessionId: string) => {
      if (activeSessionId === sessionId) {
        const nextDraftKey = draftKey + 1
        setActiveSessionId(null)
        setLoadedSessionId(null)
        setDraftKey(nextDraftKey)
        setChatInstanceKey(`draft-${nextDraftKey}`)
      }
    },
    [activeSessionId, draftKey],
  )

  const showMessagesLoading = shouldLoadMessages && isLoadingMessages

  return (
    <AppShell
      title={activeTitle}
      chatSessions={sessions}
      activeSessionId={activeSessionId ?? undefined}
      isStreaming={isStreaming}
      onNewChat={handleNewChat}
      onSelectSession={handleSelectSession}
      onDeleteSession={handleDeleteSession}
    >
      {showMessagesLoading ? (
        <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
          Loading conversation…
        </div>
      ) : (
        <PulseChat
          key={chatInstanceKey}
          chatInstanceKey={chatInstanceKey}
          sessionId={activeSessionId}
          initialMessages={messagesPage?.messages ?? []}
          initialHasMore={messagesPage?.hasMore ?? false}
          initialOldestSequence={messagesPage?.oldestSequence ?? null}
          onSessionCreated={handleSessionCreated}
          onConversationSaved={handleConversationSaved}
          onStreamStatusChange={setIsStreaming}
        />
      )}
    </AppShell>
  )
}
