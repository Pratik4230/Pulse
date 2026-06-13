"use client"

import Link from "next/link"
import {
  CalendarDays,
  Inbox,
  LogOut,
  MessageSquare,
  MessageSquarePlus,
  Plug,
  Sparkles,
} from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { toast } from "sonner"

import { PulseLogo } from "@/components/brand/pulse-logo"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { signOut, useSession } from "@/lib/auth-client"
import { cn } from "@/lib/utils"

export type ChatSession = {
  id: string
  title: string
}

type PulseSidebarProps = {
  sessions?: ChatSession[]
  activeSessionId?: string
  onNewChat?: () => void
  onSelectSession?: (id: string) => void
}

function getInitials(name?: string | null, email?: string | null) {
  if (name?.trim()) {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()
  }
  return email?.slice(0, 2).toUpperCase() ?? "P"
}

export function PulseSidebar({
  sessions,
  activeSessionId,
  onNewChat,
  onSelectSession,
}: PulseSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { data: session } = useSession()
  async function handleSignOut() {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          toast.success("Signed out")
          router.push("/login")
          router.refresh()
        },
      },
    })
  }

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/pulse">
                <PulseLogo size={32} imageClassName="size-8" />
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Pulse</span>
                  <span className="truncate text-xs text-muted-foreground">
                    AI workspace
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {sessions && onNewChat && onSelectSession ? (
          <>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={onNewChat} tooltip="New chat">
                      <MessageSquarePlus />
                      <span>New chat</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>Chats</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {sessions.map((chat) => (
                    <SidebarMenuItem key={chat.id}>
                      <SidebarMenuButton
                        isActive={chat.id === activeSessionId}
                        onClick={() => onSelectSession(chat.id)}
                        tooltip={chat.title}
                        className="group/chat"
                      >
                        <MessageSquare className="size-4 shrink-0 text-muted-foreground group-data-[active=true]/chat:text-primary" />
                        <span className="truncate">{chat.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        ) : null}

        <SidebarGroup
          className={
            sessions && onNewChat && onSelectSession ? undefined : "mt-0"
          }
        >
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/pulse"}
                  tooltip="Assistant"
                >
                  <Link href="/pulse">
                    <Sparkles />
                    <span>Assistant</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton disabled tooltip="Coming soon">
                  <Inbox />
                  <span>Inbox</span>
                  <span className="ml-auto text-[10px] uppercase tracking-wide text-muted-foreground">
                    Soon
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton disabled tooltip="Coming soon">
                  <CalendarDays />
                  <span>Calendar</span>
                  <span className="ml-auto text-[10px] uppercase tracking-wide text-muted-foreground">
                    Soon
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith("/settings/integrations")}
                  tooltip="Integrations"
                >
                  <Link href="/settings/integrations">
                    <Plug />
                    <span>Integrations</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent"
                >
                  <Avatar className="size-8 rounded-lg">
                    <AvatarFallback className="rounded-lg">
                      {getInitials(session?.user.name, session?.user.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">
                      {session?.user.name ?? "Account"}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {session?.user.email}
                    </span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56"
                side="top"
                align="start"
                sideOffset={4}
              >
                <DropdownMenuItem asChild>
                  <Link href="/settings/integrations">
                    <Plug className={cn("size-4")} />
                    Integrations
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className={cn("size-4")} />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
