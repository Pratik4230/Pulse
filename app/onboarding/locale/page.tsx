import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { LocaleOnboardingForm } from "@/features/auth/components/locale-onboarding-form"
import { PulseLogo } from "@/components/brand/pulse-logo"
import { auth } from "@/lib/auth"
import { APP_HOME_PATH } from "@/lib/constants"
import { userHasLocale } from "@/lib/locale"

export default async function LocaleOnboardingPage() {
  let session = null

  try {
    session = await auth.api.getSession({
      headers: await headers(),
    })
  } catch {
    redirect("/login?error=db")
  }

  if (!session) {
    redirect("/login")
  }

  if (userHasLocale(session.user)) {
    redirect(APP_HOME_PATH)
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6">
      <PulseLogo size={48} showLabel />
      <LocaleOnboardingForm />
    </div>
  )
}
