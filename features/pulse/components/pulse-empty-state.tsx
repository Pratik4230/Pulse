"use client"

import { ChevronRight, Sparkles } from "lucide-react"
import { useCallback } from "react"

import { PulseLogo } from "@/components/brand/pulse-logo"
import {
  STARTER_LANGUAGES,
  STARTER_SUGGESTIONS,
} from "@/features/pulse/lib/starter-suggestions"
import { cn } from "@/lib/utils"

type PulseEmptyStateProps = {
  onSuggestion: (text: string) => void
}

export function PulseEmptyState({ onSuggestion }: PulseEmptyStateProps) {
  const handleSuggestion = useCallback(
    (text: string) => {
      onSuggestion(text)
    },
    [onSuggestion]
  )

  return (
    <div className="relative flex min-h-full flex-col items-center justify-center px-4 py-10 md:px-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute top-1/3 left-1/2 size-112 -translate-x-1/2 -translate-y-1/2 rounded-full bg-warm/25 blur-3xl" />
        <div className="absolute top-1/2 right-1/4 size-48 rounded-full bg-warm-muted/15 blur-3xl" />
      </div>

      <div className="relative flex w-full max-w-lg flex-col items-center">
        <div className="shadow-elevated-lg rounded-2xl border border-border/70 bg-card/70 p-3 backdrop-blur">
          <PulseLogo size={52} imageClassName="size-[52px]" />
        </div>

        <h2 className="mt-6 text-center text-2xl font-semibold tracking-tight text-foreground">
          What can I help you with today?
        </h2>
        <p className="mt-2 max-w-md text-center text-[15px] leading-relaxed text-muted-foreground">
          Gmail, Calendar, or both type or use the mic in{" "}
          {STARTER_LANGUAGES.join(", ")}.
        </p>

        <section className="shadow-elevated-lg mt-8 w-full overflow-hidden rounded-2xl border border-border/70 bg-card/70 backdrop-blur supports-backdrop-filter:bg-card/60">
          <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
            <Sparkles className="size-4 text-warm-muted" aria-hidden />
            <h3 className="text-xs font-semibold tracking-wider text-warm-muted uppercase">
              Try asking
            </h3>
          </div>

          <ul className="divide-y divide-border/60">
            {STARTER_SUGGESTIONS.map((item) => (
              <li key={item.lang + item.text.slice(0, 24)}>
                <button
                  type="button"
                  className={cn(
                    "group flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors",
                    "hover:bg-accent/40 focus-visible:bg-accent/40 focus-visible:outline-none"
                  )}
                  aria-label={`Use suggestion: ${item.text}`}
                  onClick={() => handleSuggestion(item.text)}
                >
                  <span className="w-18 shrink-0 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                    {item.lang}
                  </span>
                  <p className="line-clamp-2 min-w-0 flex-1 text-sm leading-snug text-foreground">
                    {item.text}
                  </p>
                  <ChevronRight
                    className="size-4 shrink-0 text-warm-muted/60 transition-transform group-hover:translate-x-0.5 group-hover:text-foreground"
                    aria-hidden
                  />
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
