"use client"

import {
  CalendarDays,
  Inbox,
  MessageSquarePlus,
  Settings,
  Sparkles,
} from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command"
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
  onFocusComposer?: () => void
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
  onFocusComposer,
  onSelectSession,
  onDeleteSession,
}: AppShellProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [paletteOpen, setPaletteOpen] = useState(false)

  useEffect(() => {
    function handleOpenPalette(event: KeyboardEvent) {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "k") {
        return
      }
      event.preventDefault()
      setPaletteOpen((open) => !open)
    }

    window.addEventListener("keydown", handleOpenPalette)
    return () => window.removeEventListener("keydown", handleOpenPalette)
  }, [])

  const commandItems = useMemo(
    () => [
      {
        group: "Navigate",
        label: "Assistant",
        icon: Sparkles,
        shortcut: "G A",
        onSelect: () => router.push("/pulse"),
      },
      {
        group: "Navigate",
        label: "Inbox",
        icon: Inbox,
        shortcut: "G I",
        onSelect: () => router.push("/inbox"),
      },
      {
        group: "Navigate",
        label: "Calendar",
        icon: CalendarDays,
        shortcut: "G C",
        onSelect: () => router.push("/calendar"),
      },
      {
        group: "Navigate",
        label: "Settings",
        icon: Settings,
        shortcut: "G S",
        onSelect: () => router.push("/settings"),
      },
      ...(onNewChat
        ? [
            {
              group: "Actions",
              label: "New chat",
              icon: MessageSquarePlus,
              shortcut: "N",
              onSelect: onNewChat,
            },
          ]
        : []),
      ...(onFocusComposer && pathname === "/pulse"
        ? [
            {
              group: "Actions",
              label: "Focus composer",
              icon: Sparkles,
              shortcut: "/",
              onSelect: onFocusComposer,
            },
          ]
        : []),
    ],
    [onFocusComposer, onNewChat, pathname, router],
  )

  const grouped = commandItems.reduce<Record<string, typeof commandItems>>(
    (acc, item) => {
      acc[item.group] = [...(acc[item.group] ?? []), item]
      return acc
    },
    {},
  )

  function runCommand(action: () => void) {
    setPaletteOpen(false)
    window.setTimeout(() => {
      action()
    }, 0)
  }

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
      <CommandDialog open={paletteOpen} onOpenChange={setPaletteOpen}>
        <Command>
          <CommandInput placeholder="Type a command..." />
          <CommandList>
            <CommandEmpty>No commands found.</CommandEmpty>
            {Object.entries(grouped).map(([group, items]) => (
              <CommandGroup key={group} heading={group}>
                {items.map((item) => (
                  <CommandItem
                    key={`${group}-${item.label}`}
                    onSelect={() => runCommand(item.onSelect)}
                  >
                    <item.icon className="size-4" />
                    <span>{item.label}</span>
                    <CommandShortcut>{item.shortcut}</CommandShortcut>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </CommandDialog>
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
