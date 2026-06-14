"use client"

import { getToolName, type DynamicToolUIPart, type ToolUIPart } from "ai"

import { Shimmer } from "@/components/ai-elements/shimmer"

import {
  getToolStatusLabelFromPart,
  isCompletedToolActivity,
  shouldShowToolActivity,
} from "../lib/tool-status-labels"

type ToolActivityProps = {
  part: ToolUIPart | DynamicToolUIPart
}

export function ToolActivity({ part }: ToolActivityProps) {
  const toolName = getToolName(part)

  if (!shouldShowToolActivity(toolName, part.state)) {
    return null
  }

  const label = getToolStatusLabelFromPart(part)
  const isComplete = isCompletedToolActivity(toolName, part.state)

  if (part.state === "output-error") {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2">
        <p className="text-sm text-muted-foreground">
          {label}: something went wrong.
        </p>
      </div>
    )
  }

  if (isComplete) {
    return (
      <div className="rounded-xl border border-border/60 bg-muted/40 px-3 py-2">
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border/60 bg-muted/50 px-3 py-2">
      <Shimmer className="text-sm text-muted-foreground">{`${label}…`}</Shimmer>
    </div>
  )
}
