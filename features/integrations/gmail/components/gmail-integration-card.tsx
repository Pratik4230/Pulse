"use client"

import { Inbox } from "lucide-react"

import { IntegrationCard } from "@/features/integrations/core/components/integration-card"
import type { IntegrationStatus } from "@/features/integrations/core/types"

import { gmailIntegration } from "../config"

type GmailIntegrationCardProps = {
  status?: IntegrationStatus
  loading?: boolean
}

export function GmailIntegrationCard({
  status,
  loading,
}: GmailIntegrationCardProps) {
  return (
    <IntegrationCard
      name={gmailIntegration.name}
      description={gmailIntegration.description}
      icon={Inbox}
      connectPath={gmailIntegration.connectPath}
      connected={status === "connected"}
      loading={loading}
    />
  )
}
