import Link from "next/link"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { PulseLogo } from "@/components/brand/pulse-logo"
import { Button } from "@/components/ui/button"
import { auth } from "@/lib/auth"
import { APP_HOME_PATH } from "@/lib/constants"
import { userHasLocale } from "@/lib/locale"

export default async function Page() {
  let session = null

  try {
    session = await auth.api.getSession({
      headers: await headers(),
    })
  } catch {
    // Database unreachable (e.g. transient Neon DNS). Show landing page.
  }

  if (session?.user.emailVerified) {
    if (!userHasLocale(session.user)) {
      redirect("/onboarding/locale")
    }
    redirect(APP_HOME_PATH)
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6">
      <div className="flex max-w-md flex-col items-center gap-3 text-center">
        <PulseLogo size={72} showLabel priority labelClassName="text-3xl" />
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
        Built for teams who live in email and calendar.
      </p>
    </div>
  )
}
