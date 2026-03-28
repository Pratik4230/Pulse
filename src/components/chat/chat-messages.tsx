"use client"

import type { UIMessage, ChatStatus } from "ai"
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message"
import {
  Reasoning,
  ReasoningTrigger,
  ReasoningContent,
} from "@/components/ai-elements/reasoning"
import { Shimmer } from "@/components/ai-elements/shimmer"
import { Button } from "@/components/ui/button"
import { RefreshCwIcon, AlertCircleIcon } from "lucide-react"

interface ChatMessagesProps {
  messages: UIMessage[]
  status: ChatStatus
  error: Error | undefined
  onRetry: () => void
}

export function ChatMessages({
  messages,
  status,
  error,
  onRetry,
}: ChatMessagesProps) {
  return (
    <>
      {messages.map((message, index) => {
        const isLast = index === messages.length - 1
        const isStreaming = isLast && status === "streaming"

        return (
          <Message from={message.role} key={message.id}>
            <MessageContent>
              {message.parts.map((part, i) => {
                const key = `${message.id}-${i}`
                switch (part.type) {
                  case "text":
                    return (
                      <MessageResponse key={key} isAnimating={isStreaming}>
                        {part.text}
                      </MessageResponse>
                    )
                  case "reasoning":
                    return (
                      <Reasoning key={key} isStreaming={isStreaming}>
                        <ReasoningTrigger />
                        <ReasoningContent>{part.reasoning}</ReasoningContent>
                      </Reasoning>
                    )
                  default:
                    return null
                }
              })}
            </MessageContent>
          </Message>
        )
      })}

      {status === "submitted" && (
        <Message from="assistant">
          <MessageContent>
            <Shimmer className="text-sm text-muted-foreground" duration={2}>
              Thinking...
            </Shimmer>
          </MessageContent>
        </Message>
      )}

      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <AlertCircleIcon className="size-5 shrink-0 text-destructive" />
          <div className="flex-1">
            <p className="text-sm font-medium text-destructive">
              Something went wrong
            </p>
            <p className="text-xs text-muted-foreground">
              {error.message}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RefreshCwIcon className="mr-1.5 size-3.5" />
            Retry
          </Button>
        </div>
      )}
    </>
  )
}
