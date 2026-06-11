"use client"

import { nanoid } from "nanoid"
import { useCallback, useState } from "react"

import { PulseChat } from "@/features/chat/components/pulse-chat"
import {
  PulseSidebar,
  type ChatSession,
} from "@/features/chat/components/pulse-sidebar"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"

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

  return (
    <>
      <PulseSidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onNewChat={handleNewChat}
        onSelectSession={handleSelectSession}
      />
      <SidebarInset className="flex h-full min-h-0 flex-col overflow-hidden">
        <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="truncate text-sm font-medium">
            {sessions.find((s) => s.id === activeSessionId)?.title ??
              "New chat"}
          </h1>
        </header>
        <PulseChat
          key={activeSessionId}
          onFirstMessage={handleFirstMessage}
        />
      </SidebarInset>
    </>
  )
}
