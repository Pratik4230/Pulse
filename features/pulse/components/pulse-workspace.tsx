"use client"

import { nanoid } from "nanoid"
import { useCallback, useState } from "react"

import { AppShell } from "@/features/pulse/components/app-shell"
import { PulseChat } from "@/features/pulse/components/pulse-chat"
import type { ChatSession } from "@/features/pulse/components/pulse-sidebar"

function createSession(title = "New chat"): ChatSession {
  return { id: nanoid(), title }
}

export function PulseWorkspace() {
  const [sessions, setSessions] = useState<ChatSession[]>(() => [
    createSession(),
  ])
  const [activeSessionId, setActiveSessionId] = useState(sessions[0].id)

  const handleNewChat = useCallback(() => {
    const session = createSession()
    setSessions((current) => [session, ...current])
    setActiveSessionId(session.id)
  }, [])

  const handleSelectSession = useCallback((id: string) => {
    setActiveSessionId(id)
  }, [])

  const handleFirstMessage = useCallback(
    (title: string) => {
      setSessions((current) =>
        current.map((session) =>
          session.id === activeSessionId
            ? { ...session, title: title || "New chat" }
            : session,
        ),
      )
    },
    [activeSessionId],
  )

  const activeTitle =
    sessions.find((s) => s.id === activeSessionId)?.title ?? "New chat"

  return (
    <AppShell
      title={activeTitle}
      chatSessions={sessions}
      activeSessionId={activeSessionId}
      onNewChat={handleNewChat}
      onSelectSession={handleSelectSession}
    >
      <PulseChat key={activeSessionId} onFirstMessage={handleFirstMessage} />
    </AppShell>
  )
}
