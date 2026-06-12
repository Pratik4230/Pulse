import { managementHandler } from "corsair"
import { setupCorsair } from "corsair/setup"

import { corsair } from "@/features/integrations/core/corsair/corsair"
import type {
  IntegrationId,
  IntegrationStatus,
} from "@/features/integrations/core/types"

export type { IntegrationId, IntegrationStatus }

const management = managementHandler(corsair, {
  basePath: "/api/corsair",
})

export async function ensureCorsairTenant(tenantId: string) {
  await setupCorsair(corsair, { tenantId })
}

export async function getIntegrationStatuses(
  tenantId: string,
): Promise<Record<IntegrationId, IntegrationStatus>> {
  const response = await management(
    new Request(
      `http://internal/api/corsair/connection-status?tenantId=${encodeURIComponent(tenantId)}`,
    ),
  )

  if (!response.ok) {
    throw new Error("Failed to load integration status")
  }

  const data = (await response.json()) as Record<string, IntegrationStatus>
  return {
    gmail: data.gmail ?? "not_connected",
    googlecalendar: data.googlecalendar ?? "not_connected",
  }
}
