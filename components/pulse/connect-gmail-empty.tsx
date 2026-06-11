import { Mail } from "lucide-react"

import { Button } from "@/components/ui/button"

export function ConnectGmailEmpty() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
        <Mail className="size-6 text-muted-foreground" />
      </div>
      <div className="max-w-sm space-y-1">
        <h2 className="text-lg font-semibold">Connect Gmail</h2>
        <p className="text-sm text-muted-foreground">
          Link your inbox to see threads here. Corsair integration is next on
          the roadmap.
        </p>
      </div>
      <Button type="button" disabled>
        Connect Gmail
      </Button>
    </div>
  )
}
