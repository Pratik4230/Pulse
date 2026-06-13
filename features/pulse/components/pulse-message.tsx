"use client"

import type { UIMessage } from "ai"
import { isToolUIPart } from "ai"
import { Fragment } from "react"

import { PulseLogo } from "@/components/brand/pulse-logo"
import { cn } from "@/lib/utils"

import { PulseRichContent } from "./pulse-rich-content"
import { ToolActivity } from "./tool-activity"

type PulseMessageProps = {
  message: UIMessage
}

export function PulseUserMessage({ text }: { text: string }) {
  return (
    <div className="flex justify-end pl-8">
      <div
        className={cn(
          "max-w-[min(85%,42rem)] rounded-2xl rounded-br-md px-4 py-3",
          "border border-border bg-accent/60 text-sm leading-relaxed text-foreground shadow-elevated",
        )}
      >
        {text}
      </div>
    </div>
  )
}

export function PulseAssistantMessage({ message }: PulseMessageProps) {
  return (
    <div className="flex gap-3 pr-4">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border/60 bg-card shadow-elevated">
        <PulseLogo size={18} imageClassName="size-[18px] rounded-md" />
      </div>
      <div className="min-w-0 flex-1 space-y-3">
        {message.parts.map((part, index) => (
          <Fragment key={`${message.id}-${index}`}>
            {part.type === "text" ? (
              <div
                className={cn(
                  "shadow-elevated rounded-2xl rounded-tl-md border border-border/60 bg-card px-4 py-3.5",
                )}
              >
                <PulseRichContent text={part.text} />
              </div>
            ) : null}
            {isToolUIPart(part) ? <ToolActivity part={part} /> : null}
          </Fragment>
        ))}
      </div>
    </div>
  )
}

export function PulseMessage({ message }: PulseMessageProps) {
  if (message.role === "user") {
    const text = message.parts
      .filter((part) => part.type === "text")
      .map((part) => part.text)
      .join("\n")

    return <PulseUserMessage text={text} />
  }

  return <PulseAssistantMessage message={message} />
}
