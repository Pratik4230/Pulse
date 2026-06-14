"use client"

import { Inbox, Mail } from "lucide-react"

import { MessageResponse } from "@/components/ai-elements/message"
import { cn } from "@/lib/utils"

import { parseEmailBlocks } from "../lib/parse-email-blocks"

type PulseRichContentProps = {
  text: string
  className?: string
}

const proseContentClasses = cn(
  "prose prose-sm max-w-none dark:prose-invert",
  "prose-p:my-2 prose-p:leading-relaxed prose-p:text-foreground/90",
  "prose-strong:font-semibold prose-strong:text-foreground",
  "prose-headings:mb-2 prose-headings:mt-3 prose-headings:text-foreground",
  "prose-ul:my-2 prose-ul:ml-0 prose-ul:pl-5",
  "prose-ol:my-2 prose-ol:ml-0 prose-ol:pl-5",
  "prose-li:my-0.5 prose-li:pl-1 prose-li:text-foreground/90",
  "prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
)

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
        "group relative overflow-hidden rounded-xl border border-border/70 bg-card p-4",
        "shadow-elevated transition-all hover:border-warm-muted/40 hover:shadow-[0_4px_16px_hsl(30_15%_35%/0.1)]",
      )}
    >
      <div className="absolute inset-y-0 left-0 w-0.5 bg-warm-muted/60" />
      <div className="flex items-start gap-3 pl-2">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-warm/30 text-warm-muted">
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
    <MessageResponse className={cn(proseContentClasses, className)}>
      {text}
    </MessageResponse>
  )
}

export function PulseRichContent({ text, className }: PulseRichContentProps) {
  const { intro, emails, outro } = parseEmailBlocks(text)

  if (emails.length === 0) {
    return (
      <MessageResponse className={cn(proseContentClasses, className)}>
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
