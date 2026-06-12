"use client"

import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  PulseSidebar,
  type ChatSession,
} from "@/features/pulse/components/pulse-sidebar"

type AppShellProps = {
  title: string
  children: React.ReactNode
  chatSessions?: ChatSession[]
  activeSessionId?: string
  onNewChat?: () => void
  onSelectSession?: (id: string) => void
}

export function AppShell({
  title,
  children,
  chatSessions,
  activeSessionId,
  onNewChat,
  onSelectSession,
}: AppShellProps) {
  return (
    <>
      <PulseSidebar
        sessions={chatSessions}
        activeSessionId={activeSessionId}
        onNewChat={onNewChat}
        onSelectSession={onSelectSession}
      />
      <SidebarInset className="flex h-full min-h-0 flex-col overflow-hidden">
        <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="truncate text-sm font-medium">{title}</h1>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </SidebarInset>
    </>
  )
}
