"use client"

import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport, type UIMessage } from "ai"
import { nanoid } from "nanoid"
import { useCallback, useEffect, useLayoutEffect, useState } from "react"
import { toast } from "sonner"

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
import { Button } from "@/components/ui/button"
import { Shimmer } from "@/components/ai-elements/shimmer"
import { cn } from "@/lib/utils"

import { fetchOlderChatMessages } from "@/features/pulse/hooks/use-chat-messages"
import { PulseEmptyState } from "./pulse-empty-state"
import { PulseMessage } from "./pulse-message"

const pulseChatSessionId = { value: null as string | null }

const pulseChatTransport = new DefaultChatTransport({
  api: "/api/chat",
  body: () => ({
    sessionId: pulseChatSessionId.value,
  }),
})

type PulseChatProps = {
  chatInstanceKey: string
  sessionId: string | null
  draftKey: number
  initialMessages?: UIMessage[]
  initialHasMore?: boolean
  initialOldestSequence?: number | null
  onSessionCreated?: (sessionId: string, title: string) => void
  onConversationSaved?: (sessionId: string) => void
  onStreamStatusChange?: (isStreaming: boolean) => void
}

export function PulseChat({
  chatInstanceKey,
  sessionId,
  draftKey,
  initialMessages = [],
  initialHasMore = false,
  initialOldestSequence = null,
  onSessionCreated,
  onConversationSaved,
  onStreamStatusChange,
}: PulseChatProps) {
  useLayoutEffect(() => {
    if (sessionId) {
      pulseChatSessionId.value = sessionId
    }
  }, [sessionId])

  const [hasOlder, setHasOlder] = useState(initialHasMore)
  const [oldestSequence, setOldestSequence] = useState<number | null>(
    initialOldestSequence,
  )
  const [loadingOlder, setLoadingOlder] = useState(false)

  const { messages, sendMessage, status, stop, error, setMessages } = useChat({
    id: chatInstanceKey,
    messages: initialMessages,
    transport: pulseChatTransport,
    onFinish: () => {
      const savedSessionId = pulseChatSessionId.value
      if (savedSessionId) {
        onConversationSaved?.(savedSessionId)
      }
    },
  })

  useEffect(() => {
    const isStreaming = status === "submitted" || status === "streaming"
    onStreamStatusChange?.(isStreaming)
  }, [onStreamStatusChange, status])

  const ensureSessionId = useCallback(() => {
    if (pulseChatSessionId.value) {
      return pulseChatSessionId.value
    }

    const id = nanoid()
    pulseChatSessionId.value = id
    return id
  }, [])

  const handleSubmit = useCallback(
    async ({ text }: PromptInputMessage) => {
      const trimmed = text.trim()
      if (!trimmed || status !== "ready") return

      const isFirstMessage = messages.length === 0
      const id = ensureSessionId()

      if (isFirstMessage) {
        onSessionCreated?.(id, trimmed.slice(0, 48))
      }

      await sendMessage({ text: trimmed })
    },
    [
      ensureSessionId,
      messages.length,
      onSessionCreated,
      sendMessage,
      status,
    ],
  )

  const handleSuggestion = useCallback(
    (suggestion: string) => {
      void handleSubmit({ text: suggestion, files: [] })
    },
    [handleSubmit],
  )

  const handleLoadOlder = useCallback(async () => {
    const activeSessionId = pulseChatSessionId.value
    if (!activeSessionId || oldestSequence == null || loadingOlder) return

    setLoadingOlder(true)
    try {
      const page = await fetchOlderChatMessages(activeSessionId, oldestSequence)
      setMessages((current) => [...page.messages, ...current])
      setHasOlder(page.hasMore)
      setOldestSequence(page.oldestSequence)
    } catch {
      toast.error("Could not load older messages")
    } finally {
      setLoadingOlder(false)
    }
  }, [loadingOlder, oldestSequence, setMessages])

  return (
    <div className="relative flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.88_0.09_68/0.14),transparent_62%)] dark:bg-[radial-gradient(ellipse_at_top,oklch(1_0_0/0.03),transparent_55%)]"
      />

      <Conversation className="relative h-full min-h-0 flex-1">
        <ConversationContent className="mx-auto w-full max-w-3xl gap-8 px-4 pb-6 pt-2 md:px-6">
          {hasOlder ? (
            <div className="flex justify-center">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
                disabled={loadingOlder}
                onClick={() => void handleLoadOlder()}
              >
                {loadingOlder ? "Loading…" : "Load older messages"}
              </Button>
            </div>
          ) : null}

          {messages.length === 0 && status === "ready" ? (
            <PulseEmptyState onSuggestion={handleSuggestion} />
          ) : (
            messages.map((message) => (
              <PulseMessage key={message.id} message={message} />
            ))
          )}

          {status === "submitted" && (
            <div className="flex gap-3 pr-4">
              <div className="size-8 shrink-0" />
              <div className="shadow-elevated rounded-2xl border border-border/60 bg-card px-5 py-4 sm:px-6">
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
