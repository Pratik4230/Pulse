"use client"

import { Suggestions, Suggestion } from "@/components/ai-elements/suggestion"
import { SparklesIcon } from "lucide-react"

const suggestions = [
  "Explain quantum computing in simple terms",
  "Write a haiku about coding",
  "What are the best practices for React?",
  "Help me debug a TypeScript error",
]

interface ChatEmptyStateProps {
  onSuggestionClick: (suggestion: string) => void
}

export function ChatEmptyState({ onSuggestionClick }: ChatEmptyStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 p-8">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10">
          <SparklesIcon className="size-6 text-primary" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-semibold tracking-tight">
            How can I help you today?
          </h2>
          <p className="text-sm text-muted-foreground">
            Ask me anything or pick a suggestion below
          </p>
        </div>
      </div>

      <Suggestions className="justify-center flex-wrap gap-2">
        {suggestions.map((s) => (
          <Suggestion key={s} suggestion={s} onClick={onSuggestionClick} />
        ))}
      </Suggestions>
    </div>
  )
}
