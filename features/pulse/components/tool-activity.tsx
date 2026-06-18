"use client"

import { Shimmer } from "@/components/ai-elements/shimmer"

import type { ActiveToolStatus } from "../lib/tool-status-labels"

type ToolStatusLineProps = {
  status: ActiveToolStatus
}

export function ToolStatusLine({ status }: ToolStatusLineProps) {
  if (status.isError) {
    return (
      <div className="text-xs text-destructive/80">{status.label}</div>
    )
  }

  return (
    <div className="text-xs text-muted-foreground/80">
      <Shimmer as="span">{`${status.label}...`}</Shimmer>
    </div>
  )
}
