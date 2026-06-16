import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { AppShell } from "@/features/pulse/components/app-shell"
import { LocaleSettingsForm } from "@/features/settings/components/locale-settings-form"
import { auth } from "@/lib/auth"
import { DEFAULT_COUNTRY } from "@/lib/currencies"
import { getDefaultTimezone } from "@/lib/timezones"

export default async function SettingsLocalePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/login")
  }

  const country = session.user.country ?? DEFAULT_COUNTRY
  const timezone = session.user.timezone ?? getDefaultTimezone(country)

  return (
    <AppShell title="Locale and currency">
      <div className="mx-auto w-full max-w-3xl p-6">
        <LocaleSettingsForm country={country} timezone={timezone} />
      </div>
    </AppShell>
  )
}
