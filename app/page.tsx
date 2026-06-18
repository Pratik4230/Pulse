import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { LandingPage } from "@/features/marketing/components/landing-page"
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
    // Database unreachable - show landing page.
  }

  if (session?.user.emailVerified) {
    if (!userHasLocale(session.user)) {
      redirect("/onboarding/locale")
    }
    redirect(APP_HOME_PATH)
  }

  return <LandingPage />
}
