"use client"

import { CalendarDays } from "lucide-react"

import { IntegrationCard } from "@/features/integrations/core/components/integration-card"
import type { IntegrationStatus } from "@/features/integrations/core/types"

import { calendarIntegration } from "../config"

type CalendarIntegrationCardProps = {
  status?: IntegrationStatus
  loading?: boolean
}

export function CalendarIntegrationCard({
  status,
  loading,
}: CalendarIntegrationCardProps) {
  return (
    <IntegrationCard
      name={calendarIntegration.name}
      description={calendarIntegration.description}
      icon={CalendarDays}
      connectPath={calendarIntegration.connectPath}
      connected={status === "connected"}
      loading={loading}
    />
  )
}
