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
import { SpeechInput } from "@/components/ai-elements/speech-input"
import { Button } from "@/components/ui/button"
import { Shimmer } from "@/components/ai-elements/shimmer"
import { cn } from "@/lib/utils"
import {
  assertOkResponse,
  formatRateLimitMessage,
  getRateLimitRetrySeconds,
  isRateLimitError,
  notifyRateLimitError,
} from "@/lib/api-client"

import { fetchOlderChatMessages } from "@/features/pulse/hooks/use-chat-messages"
import { useAiUsage } from "@/features/pulse/hooks/use-ai-usage"
import { useTranscribeAudio } from "@/features/pulse/hooks/use-transcribe-audio"
import { UpgradeCta } from "@/features/billing/components/upgrade-cta"
import {
  CHAT_MAX_MESSAGE_CHARS,
  MAX_VOICE_RECORDING_MS,
} from "@/features/pulse/validations"
import { PulseEmptyState } from "./pulse-empty-state"
import { PulseMessage } from "./pulse-message"

const pulseChatSessionId = { value: null as string | null }

const pulseChatTransport = new DefaultChatTransport({
  api: "/api/chat",
  body: () => ({
    sessionId: pulseChatSessionId.value,
  }),
  fetch: async (input, init) => {
    const response = await fetch(input, init)
    if (!response.ok) {
      await assertOkResponse(response)
    }
    return response
  },
})
const CHAT_INPUT_ID = "pulse-chat-input"

type PulseChatProps = {
  chatInstanceKey: string
  sessionId: string | null
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
    initialOldestSequence
  )
  const [loadingOlder, setLoadingOlder] = useState(false)

  const transcribeAudio = useTranscribeAudio()
  const { data: aiUsage, refetch: refetchAiUsage } = useAiUsage()

  const { messages, sendMessage, status, stop, error, setMessages } = useChat({
    id: chatInstanceKey,
    messages: initialMessages,
    transport: pulseChatTransport,
    onFinish: () => {
      const savedSessionId = pulseChatSessionId.value
      if (savedSessionId) {
        onConversationSaved?.(savedSessionId)
      }
      void refetchAiUsage()
    },
    onError: (chatError) => {
      if (isRateLimitError(chatError)) {
        notifyRateLimitError(chatError)
        void refetchAiUsage()
        return
      }

      if (
        chatError.message.includes("Pulse AI messages per day") ||
        chatError.message.includes("AI_DAILY_LIMIT")
      ) {
        toast.error(chatError.message)
        void refetchAiUsage()
        return
      }

      toast.error(chatError.message || "Could not send message")
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
    [ensureSessionId, messages.length, onSessionCreated, sendMessage, status]
  )

  const handleSuggestion = useCallback(
    (suggestion: string) => {
      void handleSubmit({ text: suggestion, files: [] })
    },
    [handleSubmit]
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

  const handleTranscriptionChange = useCallback((transcript: string) => {
    const input = document.getElementById(CHAT_INPUT_ID)
    if (!(input instanceof HTMLTextAreaElement)) return

    const current = input.value.trim()
    const next = transcript.trim()
    if (!next) return

    input.value = current ? `${current} ${next}` : next
    input.dispatchEvent(new Event("input", { bubbles: true }))
    input.focus()
  }, [])

  const handleTranscriptionError = useCallback(() => {
    toast.error("Could not transcribe audio. Try again.")
  }, [])

  const handleMaxRecordingDuration = useCallback(() => {
    toast.message("Recording stopped: 27 second limit reached")
  }, [])

  const handleAudioRecorded = useCallback(
    async (audioBlob: Blob) => {
      try {
        const result = await transcribeAudio.mutateAsync(audioBlob)
        return result.transcript
      } catch (error) {
        if (!isRateLimitError(error)) {
          handleTranscriptionError()
        }
        return ""
      }
    },
    [handleTranscriptionError, transcribeAudio]
  )

  useEffect(() => {
    function handleFocusComposer() {
      window.requestAnimationFrame(() => {
        const input = document.getElementById(CHAT_INPUT_ID)
        if (!(input instanceof HTMLTextAreaElement)) return

        input.focus()
        const length = input.value.length
        input.setSelectionRange(length, length)
      })
    }

    window.addEventListener("pulse:focus-composer", handleFocusComposer)
    return () =>
      window.removeEventListener("pulse:focus-composer", handleFocusComposer)
  }, [])

  useEffect(() => {
    function handleKeyboardShortcuts(event: KeyboardEvent) {
      const target = event.target
      const isTypingInField =
        target instanceof HTMLElement &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)

      if (event.key === "Escape" && !isTypingInField && status !== "ready") {
        event.preventDefault()
        stop()
      }
    }

    window.addEventListener("keydown", handleKeyboardShortcuts)
    return () => window.removeEventListener("keydown", handleKeyboardShortcuts)
  }, [status, stop])

  const showUpgradeCta =
    aiUsage &&
    !aiUsage.isUnlimited &&
    (aiUsage.remaining === 0 ||
      Boolean(error?.message.includes("Pulse AI messages per day")))

  const showUpgradeHint =
    aiUsage &&
    !aiUsage.isUnlimited &&
    aiUsage.remaining > 0 &&
    aiUsage.remaining <= 2 &&
    !showUpgradeCta

  return (
    <div className="relative flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.88_0.09_68/0.14),transparent_62%)] dark:bg-[radial-gradient(ellipse_at_top,oklch(1_0_0/0.03),transparent_55%)]"
      />

      <Conversation className="relative h-full min-h-0 flex-1">
        <ConversationContent className="mx-auto w-full max-w-3xl gap-8 px-4 pt-2 pb-6 md:px-6">
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
                {loadingOlder ? "Loading..." : "Load older messages"}
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
                  Thinking...
                </Shimmer>
              </div>
            </div>
          )}

          {error ? (
            <p className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-center text-sm text-destructive">
              {isRateLimitError(error)
                ? formatRateLimitMessage(getRateLimitRetrySeconds(error))
                : error.message}
            </p>
          ) : null}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="relative shrink-0 border-t border-border/80 bg-card/90 px-4 py-4 backdrop-blur-xl md:px-6">
        <div className="mx-auto w-full max-w-3xl space-y-3">
          {showUpgradeCta ? (
            <UpgradeCta
              compact
              title={
                aiUsage?.remaining === 0
                  ? "Daily AI limit reached"
                  : "Upgrade to Pulse Pro"
              }
              description="Get unlimited Pulse AI and voice. Inbox and calendar stay free."
            />
          ) : showUpgradeHint ? (
            <UpgradeCta
              compact
              title={`${aiUsage.remaining} AI message${aiUsage.remaining === 1 ? "" : "s"} left today`}
              description="Upgrade to Pro for unlimited Pulse AI and voice."
            />
          ) : null}

          <PromptInput
            onSubmit={handleSubmit}
            className={cn(
              "shadow-elevated-lg overflow-hidden rounded-3xl border border-border/80 bg-card",
              "transition-shadow focus-within:border-warm-muted/50 focus-within:shadow-[0_0_0_3px_oklch(0.88_0.09_68/0.2)]"
            )}
          >
            <PromptInputBody>
              <PromptInputTextarea
                id={CHAT_INPUT_ID}
                maxLength={CHAT_MAX_MESSAGE_CHARS}
                className="min-h-16 flex-1 resize-none bg-transparent px-5 py-4 text-[18px] leading-relaxed placeholder:text-muted-foreground/70"
                placeholder="Message Pulse..."
              />
            </PromptInputBody>
            <PromptInputFooter className="border-t border-border/60 bg-muted/20 px-3 py-2">
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <SpeechInput
                  aria-label="Use microphone"
                  variant="ghost"
                  size="icon-sm"
                  className="text-muted-foreground hover:text-foreground"
                  maxDurationMs={MAX_VOICE_RECORDING_MS}
                  onMaxDurationReached={handleMaxRecordingDuration}
                  onAudioRecorded={handleAudioRecorded}
                  onTranscriptionChange={handleTranscriptionChange}
                />
                {aiUsage && !aiUsage.isUnlimited ? (
                  <p className="truncate text-xs text-muted-foreground">
                    {aiUsage.remaining} of {aiUsage.limit} messages left today
                  </p>
                ) : null}
              </div>
              <div className="flex items-center gap-1">
                <PromptInputSubmit
                  onStop={stop}
                  status={status}
                  className="rounded-full"
                />
              </div>
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    </div>
  )
}
