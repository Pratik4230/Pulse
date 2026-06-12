"use client"

import { getToolName, type DynamicToolUIPart, type ToolUIPart } from "ai"

import { Shimmer } from "@/components/ai-elements/shimmer"

import {
  getToolStatusLabelFromPart,
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

  if (part.state === "output-error") {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2">
        <p className="text-sm text-muted-foreground">
          {label} — something went wrong.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border/50 bg-muted/20 px-3 py-2">
      <Shimmer className="text-sm text-muted-foreground">{`${label}…`}</Shimmer>
    </div>
  )
}
