"use client"

import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { Fragment, useCallback } from "react"

import { PulseLogo } from "@/components/brand/pulse-logo"

import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation"
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message"
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input"
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion"
import { Shimmer } from "@/components/ai-elements/shimmer"

const STARTER_PROMPTS = [
  "What can Pulse do for my inbox and calendar?",
  "How do I connect Gmail to Pulse?",
  "Draft a polite meeting follow-up email",
  "Plan my day around email and calendar tasks",
] as const

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
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <Conversation className="min-h-0 flex-1 overflow-hidden">
        <ConversationContent className="mx-auto w-full max-w-3xl gap-6 px-4 pb-4">
          {messages.length === 0 ? (
            <ConversationEmptyState
              className="min-h-0 flex-1"
              description="Ask about email, calendar, or what to tackle next. Pulse is your command center."
              icon={<PulseLogo size={48} />}
              title="What should we work on?"
            />
          ) : (
            messages.map((message) => (
              <Message key={message.id} from={message.role}>
                <MessageContent>
                  {message.parts.map((part, index) => (
                    <Fragment key={`${message.id}-${index}`}>
                      {part.type === "text" ? (
                        <MessageResponse>{part.text}</MessageResponse>
                      ) : null}
                    </Fragment>
                  ))}
                </MessageContent>
              </Message>
            ))
          )}
          {status === "submitted" && (
            <Message from="assistant">
              <MessageContent>
                <Shimmer>Thinking…</Shimmer>
              </MessageContent>
            </Message>
          )}
          {error && (
            <p className="text-center text-sm text-destructive">
              {error.message}
            </p>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="shrink-0 border-t bg-background/80 px-4 py-4 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-3">
          {messages.length === 0 && (
            <Suggestions>
              {STARTER_PROMPTS.map((prompt) => (
                <Suggestion
                  key={prompt}
                  onClick={handleSuggestion}
                  suggestion={prompt}
                />
              ))}
            </Suggestions>
          )}

          <PromptInput onSubmit={handleSubmit}>
            <PromptInputBody>
              <PromptInputTextarea placeholder="Message Pulse…" />
            </PromptInputBody>
            <PromptInputFooter>
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
