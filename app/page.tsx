import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Kbd } from "@/components/ui/kbd"

export default function Page() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6">
      <div className="flex max-w-md flex-col items-center gap-3 text-center">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Pulse
        </h1>
        <p className="text-sm text-muted-foreground">
          Your keyboard-first command center for email and calendar.
        </p>
      </div>
      <div className="flex gap-3">
        <Button asChild>
          <Link href="/login">Sign in</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/signup">Sign up</Link>
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Press <Kbd>d</Kbd> to toggle dark mode
      </p>
    </div>
  )
}
