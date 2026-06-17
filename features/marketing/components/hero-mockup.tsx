"use client"

import { motion } from "motion/react"
import { CalendarDays, Circle, Mail, Sparkles } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import { HERO_MOCKUP_SHORTCUTS } from "@/lib/app-shortcuts"
import { cn } from "@/lib/utils"

const INBOX_ROWS = [
  {
    from: "Sarah Chen",
    subject: "Q2 roadmap review, feedback by Friday",
    time: "2m",
    unread: true,
  },
  {
    from: "Stripe",
    subject: "Your payout for March is on the way",
    time: "18m",
    unread: true,
  },
  {
    from: "Alex Rivera",
    subject: "Re: Design system tokens",
    time: "1h",
    unread: false,
  },
  {
    from: "Notion",
    subject: "Weekly digest: 3 pages updated",
    time: "3h",
    unread: false,
  },
]

export function HeroMockup({ className }: { className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32, rotateX: 8 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      className={cn("perspective-distant", className)}
    >
      <div className="shadow-elevated-lg relative overflow-hidden rounded-2xl border border-border/70 bg-card ring-1 ring-black/3">
        <div className="flex items-center gap-2 border-b border-border/60 bg-muted/40 px-4 py-3">
          <div className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-[#ff5f57]" />
            <span className="size-2.5 rounded-full bg-[#febc2e]" />
            <span className="size-2.5 rounded-full bg-[#28c840]" />
          </div>
          <div className="mx-auto flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-3 py-1 text-[11px] text-muted-foreground">
            <Mail className="size-3" />
            pulse.app / inbox
          </div>
          <Badge variant="secondary" className="hidden sm:inline-flex">
            Live
          </Badge>
        </div>

        <div className="grid md:grid-cols-[220px_1fr]">
          <aside className="hidden border-r border-border/60 bg-sidebar/50 p-3 md:block">
            <nav className="space-y-1">
              {[
                { icon: Mail, label: "Inbox", active: true, count: 12 },
                { icon: CalendarDays, label: "Calendar", active: false },
                { icon: Sparkles, label: "Pulse AI", active: false },
              ].map((item) => (
                <div
                  key={item.label}
                  className={cn(
                    "flex items-center justify-between rounded-lg px-2.5 py-2 text-xs",
                    item.active
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <item.icon className="size-3.5" />
                    {item.label}
                  </span>
                  {item.count ? (
                    <span className="rounded-full bg-warm/30 px-1.5 text-[10px] font-medium">
                      {item.count}
                    </span>
                  ) : null}
                </div>
              ))}
            </nav>

            <div className="mt-6 rounded-xl border border-border/60 bg-background/60 p-3">
              <p className="text-[10px] font-medium tracking-wide text-warm-muted uppercase">
                Shortcuts
              </p>
              <div className="mt-2 space-y-1.5 text-[11px] text-muted-foreground">
                {HERO_MOCKUP_SHORTCUTS.map((shortcut) => (
                  <div
                    key={shortcut.label}
                    className="flex items-center justify-between"
                  >
                    <span>{shortcut.label}</span>
                    <KbdGroup>
                      {shortcut.keys.map((key) => (
                        <Kbd key={key}>{key}</Kbd>
                      ))}
                    </KbdGroup>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <div className="min-h-[280px] p-3 sm:p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Inbox</h3>
              <span className="text-[11px] text-muted-foreground">
                Synced just now
              </span>
            </div>

            <ul className="space-y-1">
              {INBOX_ROWS.map((row, index) => (
                <motion.li
                  key={row.subject}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + index * 0.08, duration: 0.4 }}
                  className={cn(
                    "flex items-start gap-3 rounded-xl border border-transparent px-3 py-2.5 transition-colors",
                    index === 0 && "border-border/60 bg-accent/50"
                  )}
                >
                  {row.unread ? (
                    <Circle className="mt-1.5 size-2 shrink-0 fill-warm text-warm" />
                  ) : (
                    <span className="mt-1.5 size-2 shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p
                        className={cn(
                          "truncate text-sm",
                          row.unread ? "font-semibold" : "text-foreground/80"
                        )}
                      >
                        {row.from}
                      </p>
                      <span className="shrink-0 text-[10px] text-muted-foreground">
                        {row.time}
                      </span>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {row.subject}
                    </p>
                  </div>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute -inset-8 -z-10 rounded-[2rem] bg-linear-to-br from-warm/25 via-transparent to-primary/10 blur-3xl"
      />
    </motion.div>
  )
}
