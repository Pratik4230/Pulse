"use client"

import { ChevronDown, ChevronRight } from "lucide-react"
import { useCallback, useState } from "react"

import { PulseLogo } from "@/components/brand/pulse-logo"
import { Button } from "@/components/ui/button"
import {
  STARTER_LANGUAGES,
  STARTER_SUGGESTION_GROUPS,
  type StarterSuggestionGroup,
} from "@/features/pulse/lib/starter-suggestions"
import { cn } from "@/lib/utils"

const VISIBLE_COUNT = 3

type PulseEmptyStateProps = {
  onSuggestion: (text: string) => void
}

function SuggestionGroupList({
  group,
  onSuggestion,
}: {
  group: StarterSuggestionGroup
  onSuggestion: (text: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const hasMore = group.items.length > VISIBLE_COUNT
  const visibleItems = expanded
    ? group.items
    : group.items.slice(0, VISIBLE_COUNT)
  const Icon = group.icon

  return (
    <section className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-elevated">
      <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
        <Icon className="size-4 text-warm-muted" aria-hidden />
        <h3 className="text-xs font-semibold tracking-wider text-warm-muted uppercase">
          {group.title}
        </h3>
      </div>

      <ul className="divide-y divide-border/60">
        {visibleItems.map((item) => (
          <li
            key={`${group.id}-${item.lang}`}
            className="group flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-accent/40"
          >
            <span className="w-20 shrink-0 select-none text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
              {item.lang}
            </span>
            <p className="min-w-0 flex-1 select-text cursor-text text-sm leading-snug text-foreground">
              {item.text}
            </p>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="shrink-0 text-warm-muted hover:text-foreground"
              aria-label={`Use suggestion: ${item.text}`}
              onClick={() => onSuggestion(item.text)}
            >
              <ChevronRight className="size-4" />
            </Button>
          </li>
        ))}
      </ul>

      {hasMore ? (
        <div className="border-t border-border/60 px-4 py-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mx-auto flex w-full text-muted-foreground hover:text-foreground"
            onClick={() => setExpanded((current) => !current)}
          >
            {expanded ? "Show less" : "Show more"}
            <ChevronDown
              className={cn(
                "size-4 transition-transform",
                expanded && "rotate-180",
              )}
            />
          </Button>
        </div>
      ) : null}
    </section>
  )
}

export function PulseEmptyState({ onSuggestion }: PulseEmptyStateProps) {
  const handleSuggestion = useCallback(
    (text: string) => {
      onSuggestion(text)
    },
    [onSuggestion],
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
        <div className="shadow-elevated-lg rounded-2xl border border-border/70 bg-card p-3">
          <PulseLogo size={52} imageClassName="size-[52px]" />
        </div>

        <h2 className="mt-6 text-center text-2xl font-semibold tracking-tight text-foreground">
          What can I help you with today?
        </h2>
        <p className="mt-2 max-w-md text-center text-[15px] leading-relaxed text-muted-foreground">
          Gmail, Calendar, or both — type or use the mic in{" "}
          {STARTER_LANGUAGES.join(", ")}.
        </p>

        <div className="mt-8 flex w-full flex-col gap-4">
          {STARTER_SUGGESTION_GROUPS.map((group) => (
            <SuggestionGroupList
              key={group.id}
              group={group}
              onSuggestion={handleSuggestion}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
