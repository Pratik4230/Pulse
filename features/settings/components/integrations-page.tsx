"use client"

import { Plug } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { useEffect } from "react"
import { toast } from "sonner"

import { Card, CardContent } from "@/components/ui/card"
import { useIntegrationsStatus } from "@/features/integrations/core/hooks/use-integrations-status"
import { CalendarIntegrationCard } from "@/features/integrations/calendar/components/calendar-integration-card"
import { calendarIntegration } from "@/features/integrations/calendar/config"
import { GmailIntegrationCard } from "@/features/integrations/gmail/components/gmail-integration-card"
import { gmailIntegration } from "@/features/integrations/gmail/config"
import { GithubIntegrationCard } from "@/features/integrations/github/components/github-integration-card"
import { githubIntegration } from "@/features/integrations/github/config"

const CONNECTED_LABELS: Record<string, string> = {
  [gmailIntegration.id]: gmailIntegration.name,
  [calendarIntegration.id]: calendarIntegration.name,
  [githubIntegration.id]: githubIntegration.name,
}

export function IntegrationsPage() {
  const searchParams = useSearchParams()
  const { data, isLoading, isError, refetch } = useIntegrationsStatus()

  useEffect(() => {
    const connected = searchParams.get("connected")
    if (!connected) return

    const label = CONNECTED_LABELS[connected] ?? connected
    toast.success(`${label} connected`)
    void refetch()
  }, [searchParams, refetch])

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Plug className="size-4" />
          <span className="text-sm">Settings</span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Integrations</h1>
        <p className="text-sm text-muted-foreground">
          Connect the apps Pulse can act on for your account. Assistant chat
          stays focused. Connections live here.
        </p>
      </div>

      {isError ? (
        <Card>
          <CardContent className="pt-6 text-sm text-muted-foreground">
            Could not load integration status.{" "}
            <button
              type="button"
              className="text-foreground underline"
              onClick={() => void refetch()}
            >
              Try again
            </button>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4">
        <GmailIntegrationCard
          status={data?.integrations.gmail}
          loading={isLoading}
        />
        <CalendarIntegrationCard
          status={data?.integrations.googlecalendar}
          loading={isLoading}
        />
        <GithubIntegrationCard />
      </div>
    </div>
  )
}
