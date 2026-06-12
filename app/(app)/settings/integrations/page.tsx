import { Suspense } from "react"

import { AppShell } from "@/features/pulse/components/app-shell"
import { IntegrationsPage as IntegrationsPageContent } from "@/features/settings/components/integrations-page"

export default function SettingsIntegrationsPage() {
  return (
    <AppShell title="Integrations">
      <Suspense>
        <IntegrationsPageContent />
      </Suspense>
    </AppShell>
  )
}
