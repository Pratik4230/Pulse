"use client"

import { CalendarDays, Inbox, Mail, Sparkles } from "lucide-react"

import { PulseLogo } from "@/components/brand/pulse-logo"
import { cn } from "@/lib/utils"

const STARTER_CARDS = [
  {
    icon: Inbox,
    label: "List my 5 most recent emails",
    hint: "Inbox",
  },
  {
    icon: CalendarDays,
    label: "What's on my calendar today?",
    hint: "Calendar",
  },
  {
    icon: Mail,
    label: "Summarize unread emails in my inbox",
    hint: "Summarize",
  },
  {
    icon: Sparkles,
    label: "Draft a polite meeting follow-up email",
    hint: "Compose",
  },
] as const

type PulseEmptyStateProps = {
  onSuggestion: (text: string) => void
}

export function PulseEmptyState({ onSuggestion }: PulseEmptyStateProps) {
  return (
    <div className="relative flex min-h-full flex-col items-center justify-center px-6 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute top-1/3 left-1/2 size-112 -translate-x-1/2 -translate-y-1/2 rounded-full bg-warm/25 blur-3xl" />
        <div className="absolute top-1/2 right-1/4 size-48 rounded-full bg-warm-muted/15 blur-3xl" />
      </div>

      <div className="relative flex flex-col items-center text-center">
        <div className="shadow-elevated-lg rounded-2xl border border-border/70 bg-card p-3">
          <PulseLogo size={52} imageClassName="size-[52px]" />
        </div>
        <h2 className="mt-6 text-2xl font-semibold tracking-tight text-foreground">
          What should we work on?
        </h2>
        <p className="mt-2 max-w-md text-[15px] leading-relaxed text-muted-foreground">
          Ask about email, calendar, or what to tackle next. Pulse is your
          command center.
        </p>
      </div>

      <div className="relative mt-10 grid w-full max-w-2xl gap-3 sm:grid-cols-2">
        {STARTER_CARDS.map((card) => (
          <button
            key={card.label}
            type="button"
            onClick={() => onSuggestion(card.label)}
            className={cn(
              "group flex items-start gap-3 rounded-xl border border-border/70 bg-card p-4 text-left",
              "shadow-elevated transition-all hover:border-warm-muted/40 hover:shadow-[0_4px_16px_hsl(30_15%_35%/0.1)]"
            )}
          >
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-warm/30 text-warm-muted transition-colors group-hover:bg-warm/45">
              <card.icon className="size-4" />
            </div>
            <div className="min-w-0 space-y-1">
              <p className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                {card.hint}
              </p>
              <p className="text-sm leading-snug font-medium text-foreground">
                {card.label}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
