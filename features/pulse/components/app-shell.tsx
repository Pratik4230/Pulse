"use client"

import { Sparkles } from "lucide-react"

import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import {
  PulseSidebar,
  type ChatSession,
} from "@/features/pulse/components/pulse-sidebar"

type AppShellProps = {
  title: string
  children: React.ReactNode
  chatSessions?: ChatSession[]
  activeSessionId?: string
  isStreaming?: boolean
  onNewChat?: () => void
  onSelectSession?: (id: string) => void
  onDeleteSession?: (id: string) => void
}

export function AppShell({
  title,
  children,
  chatSessions,
  activeSessionId,
  isStreaming,
  onNewChat,
  onSelectSession,
  onDeleteSession,
}: AppShellProps) {
  return (
    <>
      <PulseSidebar
        sessions={chatSessions}
        activeSessionId={activeSessionId}
        isStreaming={isStreaming}
        onNewChat={onNewChat}
        onSelectSession={onSelectSession}
        onDeleteSession={onDeleteSession}
      />
      <SidebarInset className="flex h-full min-h-0 flex-col overflow-hidden bg-background">
        <header
          className={cn(
            "flex h-12 shrink-0 items-center gap-2 border-b border-border/80 px-4",
            "bg-card/90 shadow-[0_1px_0_hsl(var(--shadow-color)/0.04)] backdrop-blur-md",
          )}
        >
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-1 h-4 bg-border/80" />
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <Sparkles className="size-3.5 shrink-0 text-warm-muted" />
            <h1 className="truncate text-sm font-medium tracking-tight text-foreground">
              {title}
            </h1>
          </div>
        </header>
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {children}
        </div>
      </SidebarInset>
    </>
  )
}
