import Link from "next/link"
import { CreditCard, Globe, Plug } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AppShell } from "@/features/pulse/components/app-shell"

export default function SettingsPage() {
  return (
    <AppShell title="Settings">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-6">
        <Card>
          <CardHeader>
            <CardTitle>Integrations</CardTitle>
          </CardHeader>
          <CardContent>
            <Link
              href="/settings/integrations"
              className="inline-flex items-center gap-2 text-sm text-foreground underline-offset-4 hover:underline"
            >
              <Plug className="size-4" />
              Manage connected apps
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Billing</CardTitle>
          </CardHeader>
          <CardContent>
            <Link
              href="/settings/billing"
              className="inline-flex items-center gap-2 text-sm text-foreground underline-offset-4 hover:underline"
            >
              <CreditCard className="size-4" />
              Plans, usage, and subscription
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Locale and currency</CardTitle>
          </CardHeader>
          <CardContent>
            <Link
              href="/settings/locale"
              className="inline-flex items-center gap-2 text-sm text-foreground underline-offset-4 hover:underline"
            >
              <Globe className="size-4" />
              Update country, timezone, and currency
            </Link>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
