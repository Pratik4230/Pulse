"use client"

import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { useCallback } from "react"

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation"
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input"
import { Shimmer } from "@/components/ai-elements/shimmer"
import { cn } from "@/lib/utils"

import { PulseEmptyState } from "./pulse-empty-state"
import { PulseMessage } from "./pulse-message"

type PulseChatProps = {
  onFirstMessage?: (title: string) => void
}

export function PulseChat({ onFirstMessage }: PulseChatProps) {
  const { messages, sendMessage, status, stop, error } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
  })

  const handleSubmit = useCallback(
    async ({ text }: PromptInputMessage) => {
      const trimmed = text.trim()
      if (!trimmed || status !== "ready") return

      if (messages.length === 0) {
        onFirstMessage?.(trimmed.slice(0, 48))
      }

      await sendMessage({ text: trimmed })
    },
    [messages.length, onFirstMessage, sendMessage, status],
  )

  const handleSuggestion = useCallback(
    (suggestion: string) => {
      void sendMessage({ text: suggestion })
      if (messages.length === 0) {
        onFirstMessage?.(suggestion.slice(0, 48))
      }
    },
    [messages.length, onFirstMessage, sendMessage],
  )

  return (
    <div className="relative flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.88_0.09_68/0.14),transparent_62%)] dark:bg-[radial-gradient(ellipse_at_top,oklch(1_0_0/0.03),transparent_55%)]"
      />

      <Conversation className="relative h-full min-h-0 flex-1">
        <ConversationContent className="mx-auto w-full max-w-3xl gap-8 px-4 pb-6 pt-2 md:px-6">
          {messages.length === 0 ? (
            <PulseEmptyState onSuggestion={handleSuggestion} />
          ) : (
            messages.map((message) => (
              <PulseMessage key={message.id} message={message} />
            ))
          )}

          {status === "submitted" && (
            <div className="flex gap-3 pr-4">
              <div className="size-8 shrink-0" />
              <div className="shadow-elevated rounded-2xl border border-border/60 bg-card px-4 py-3">
                <Shimmer className="text-sm text-muted-foreground">
                  Thinking…
                </Shimmer>
              </div>
            </div>
          )}

          {error ? (
            <p className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-center text-sm text-destructive">
              {error.message}
            </p>
          ) : null}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="relative shrink-0 border-t border-border/80 bg-card/90 px-4 py-4 backdrop-blur-xl md:px-6">
        <div className="mx-auto w-full max-w-3xl">
          <PromptInput
            onSubmit={handleSubmit}
            className={cn(
              "shadow-elevated-lg overflow-hidden rounded-2xl border border-border/80 bg-card",
              "transition-shadow focus-within:border-warm-muted/50 focus-within:shadow-[0_0_0_3px_oklch(0.88_0.09_68/0.2)]",
            )}
          >
            <PromptInputBody>
              <PromptInputTextarea
                className="min-h-12 resize-none bg-transparent px-4 py-3.5 text-[15px] placeholder:text-muted-foreground/70"
                placeholder="Message Pulse…"
              />
            </PromptInputBody>
            <PromptInputFooter className="border-t border-border/60 bg-muted/40 px-3 py-2">
              <span className="text-xs text-muted-foreground">
                Pulse can make mistakes. Verify important actions.
              </span>
              <PromptInputSubmit onStop={stop} status={status} />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    </div>
  )
}
