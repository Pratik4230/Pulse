"use client"

import Link from "next/link"
import { Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type UpgradeCtaProps = {
  className?: string
  title?: string
  description?: string
  compact?: boolean
}

export function UpgradeCta({
  className,
  title = "Upgrade to Pulse Pro",
  description = "Unlimited Pulse AI and voice. Inbox and calendar stay free.",
  compact = false,
}: UpgradeCtaProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-2xl border border-warm-muted/30 bg-linear-to-br from-warm/10 via-card to-accent/20 p-4 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-warm/20 text-warm-muted">
          <Sparkles className="size-4" />
        </div>
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-medium text-foreground">{title}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <Button asChild size={compact ? "sm" : "default"} className="shrink-0">
        <Link href="/settings/billing">View plans</Link>
      </Button>
    </div>
  )
}
