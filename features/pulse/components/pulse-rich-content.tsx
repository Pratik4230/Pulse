"use client"

import { Inbox, Mail } from "lucide-react"

import { MessageResponse } from "@/components/ai-elements/message"
import { cn } from "@/lib/utils"

import { parseEmailBlocks } from "../lib/parse-email-blocks"

type PulseRichContentProps = {
  text: string
  className?: string
}

function EmailCard({
  from,
  subject,
  date,
  preview,
}: {
  from: string
  subject: string
  date: string
  preview: string
}) {
  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border/60 bg-card/80 p-4",
        "shadow-sm transition-colors hover:border-foreground/15 hover:bg-card",
      )}
    >
      <div className="absolute inset-y-0 left-0 w-0.5 bg-foreground/20" />
      <div className="flex items-start gap-3 pl-2">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/60 text-muted-foreground">
          <Mail className="size-4" />
        </div>
        <div className="min-w-0 flex-1 space-y-1.5">
          <p className="truncate text-sm font-medium text-foreground">{from}</p>
          <h4 className="line-clamp-2 text-[15px] font-semibold leading-snug tracking-tight">
            {subject || "No subject"}
          </h4>
          <p className="text-xs tabular-nums text-muted-foreground">{date}</p>
          {preview ? (
            <p className="line-clamp-2 pt-0.5 text-sm leading-relaxed text-muted-foreground">
              {preview}
            </p>
          ) : null}
        </div>
      </div>
    </article>
  )
}

function MarkdownSection({
  text,
  className,
}: {
  text: string
  className?: string
}) {
  if (!text.trim()) return null

  return (
    <MessageResponse
      className={cn(
        "prose prose-sm dark:prose-invert max-w-none",
        "prose-p:leading-relaxed prose-p:text-foreground/90",
        "prose-strong:text-foreground prose-li:text-foreground/90",
        "prose-a:text-foreground/80 prose-a:no-underline hover:prose-a:underline",
        className,
      )}
    >
      {text}
    </MessageResponse>
  )
}

export function PulseRichContent({ text, className }: PulseRichContentProps) {
  const { intro, emails, outro } = parseEmailBlocks(text)

  if (emails.length === 0) {
    return (
      <MessageResponse
        className={cn(
          "prose prose-sm dark:prose-invert max-w-none",
          "prose-p:leading-relaxed prose-p:text-foreground/90",
          "prose-strong:text-foreground prose-li:text-foreground/90",
          "prose-a:text-foreground/80 prose-a:no-underline hover:prose-a:underline",
          className,
        )}
      >
        {text}
      </MessageResponse>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      <MarkdownSection text={intro} />
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        <Inbox className="size-3.5" />
        <span>
          {emails.length} email{emails.length === 1 ? "" : "s"}
        </span>
      </div>
      <div className="grid gap-3">
        {emails.map((email, index) => (
          <EmailCard key={`${email.from}-${email.date}-${index}`} {...email} />
        ))}
      </div>
      <MarkdownSection text={outro} />
    </div>
  )
}
