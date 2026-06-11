import { CalendarDays, Inbox, Sparkles } from "lucide-react"

import { cn } from "@/lib/utils"

const navItems = [
  { label: "Inbox", icon: Inbox, active: true },
  { label: "Calendar", icon: CalendarDays, active: false },
  { label: "Priority", icon: Sparkles, active: false },
] as const

export function AppSidebar() {
  return (
    <aside className="flex w-52 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground">
      <nav className="flex flex-1 flex-col gap-1 p-2">
        {navItems.map((item) => (
          <button
            key={item.label}
            type="button"
            disabled={!item.active}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              item.active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-muted-foreground opacity-60",
            )}
          >
            <item.icon className="size-4 shrink-0" />
            {item.label}
            {!item.active && (
              <span className="ml-auto text-[10px] uppercase tracking-wide">
                Soon
              </span>
            )}
          </button>
        ))}
      </nav>
    </aside>
  )
}
