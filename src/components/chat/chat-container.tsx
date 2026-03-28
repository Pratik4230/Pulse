"use client"

import { useChat } from "@ai-sdk/react"
import { ChatMessages } from "@/components/chat/chat-messages"
import { ChatInput } from "@/components/chat/chat-input"
import { ChatEmptyState } from "@/components/chat/chat-empty-state"
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation"

export function ChatContainer() {
  const {
    messages,
    input,
    setInput,
    handleSubmit,
    status,
    stop,
    error,
    reload,
  } = useChat()

  const isEmptyChat = messages.length === 0

  return (
    <div className="flex h-svh flex-col">
      <header className="flex h-14 shrink-0 items-center border-b px-4">
        <h1 className="text-sm font-semibold">Pulse</h1>
      </header>

      <div className="flex flex-1 flex-col overflow-hidden">
        {isEmptyChat ? (
          <ChatEmptyState onSuggestionClick={setInput} />
        ) : (
          <Conversation className="flex-1">
            <ConversationContent className="mx-auto w-full max-w-3xl py-8">
              <ChatMessages
                messages={messages}
                status={status}
                error={error}
                onRetry={reload}
              />
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>
        )}

        <div className="shrink-0 border-t bg-background px-4 pb-4 pt-3">
          <div className="mx-auto w-full max-w-3xl">
            <ChatInput
              input={input}
              setInput={setInput}
              handleSubmit={handleSubmit}
              status={status}
              stop={stop}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
