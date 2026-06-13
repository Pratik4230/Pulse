"use client"

import { useEffect, useRef } from "react"

import { Mail, MessagesSquare } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"

import type { InboxThreadDetail } from "../types"
import { InboxThreadMessage } from "./inbox-thread-message"

type InboxPreviewProps = {
  thread: InboxThreadDetail | undefined
  isLoading: boolean
  hasSelection: boolean
}

function PreviewSkeleton() {
  return (
    <div className="mx-auto w-full max-w-176 space-y-4 px-5 py-6">
      <Skeleton className="h-7 w-2/3" />
      <Skeleton className="h-4 w-1/2" />
      <Separator />
      <Skeleton className="h-32 w-full rounded-lg" />
      <Skeleton className="h-24 w-full rounded-lg" />
    </div>
  )
}

export function InboxPreview({
  thread,
  isLoading,
  hasSelection,
}: InboxPreviewProps) {
  const focusedRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (thread && focusedRef.current) {
      focusedRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }, [thread?.focusedMessageId, thread?.threadId])

  if (!hasSelection) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
        <div className="flex size-12 items-center justify-center rounded-xl border border-border/70 bg-warm/25 text-warm-muted">
          <Mail className="size-5" />
        </div>
        <p className="text-sm font-medium text-foreground">Select an email</p>
        <p className="max-w-xs text-xs text-muted-foreground">
          Choose a message from your inbox to read the conversation here.
        </p>
      </div>
    )
  }

  if (isLoading || !thread) {
    return <PreviewSkeleton />
  }

  const isConversation = thread.messageCount > 1

  return (
    <ScrollArea className="h-full bg-muted/30">
      <div className="mx-auto w-full max-w-176 px-5 py-6">
        <header className="space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h1 className="min-w-0 flex-1 text-xl font-semibold leading-snug tracking-tight text-foreground">
              {thread.subject}
            </h1>
            {isConversation ? (
              <Badge variant="secondary" className="shrink-0 gap-1">
                <MessagesSquare className="size-3" />
                {thread.messageCount} messages
              </Badge>
            ) : null}
          </div>
          {isConversation ? (
            <p className="text-xs text-muted-foreground">
              Conversation thread — older replies are shown below. Quoted text
              can be expanded per message.
            </p>
          ) : null}
        </header>

        <Separator className="my-5" />

        <div className="space-y-4">
          {thread.messages.map((message) => {
            const isFocused = message.id === thread.focusedMessageId

            return (
              <div
                key={message.id}
                ref={isFocused ? focusedRef : undefined}
              >
                <InboxThreadMessage
                  message={message}
                  isFocused={isFocused}
                />
              </div>
            )
          })}
        </div>
      </div>
    </ScrollArea>
  )
}
