"use client"

import Link from "next/link"
import { Plug } from "lucide-react"

import { Button } from "@/components/ui/button"

export function InboxConnectPrompt() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="shadow-elevated max-w-md rounded-2xl border border-border/70 bg-card p-8">
        <h2 className="text-lg font-semibold tracking-tight">
          Connect Gmail to open Inbox
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Pulse Inbox reads your mail through Corsair. Connect Gmail once in
          settings, then browse and preview messages here.
        </p>
        <Button asChild className="mt-6">
          <Link href="/settings/integrations">
            <Plug className="size-4" />
            Connect Gmail
          </Link>
        </Button>
      </div>
    </div>
  )
}
