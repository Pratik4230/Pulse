"use client"

import type { ChatStatus } from "ai"
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputTools,
  PromptInputSubmit,
  PromptInputActionMenu,
  PromptInputActionMenuTrigger,
  PromptInputActionMenuContent,
  PromptInputActionAddAttachments,
} from "@/components/ai-elements/prompt-input"

interface ChatInputProps {
  input: string
  setInput: (value: string) => void
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  status: ChatStatus
  stop: () => void
}

export function ChatInput({
  input = "",
  setInput,
  handleSubmit,
  status,
  stop,
}: ChatInputProps) {
  return (
    <PromptInput
      onSubmit={(_) => {
        handleSubmit(new Event("submit") as unknown as React.FormEvent<HTMLFormElement>)
      }}
    >
      <PromptInputTextarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask Pulse anything..."
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            if (status !== "submitted" && status !== "streaming" && input.trim()) {
              handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>)
            }
          }
        }}
      />

      <PromptInputFooter>
        <PromptInputTools>
          <PromptInputActionMenu>
            <PromptInputActionMenuTrigger tooltip="Attach" />
            <PromptInputActionMenuContent>
              <PromptInputActionAddAttachments />
            </PromptInputActionMenuContent>
          </PromptInputActionMenu>
        </PromptInputTools>

        <PromptInputSubmit
          status={status}
          onStop={stop}
          disabled={!input.trim() && status !== "streaming" && status !== "submitted"}
        />
      </PromptInputFooter>
    </PromptInput>
  )
}
