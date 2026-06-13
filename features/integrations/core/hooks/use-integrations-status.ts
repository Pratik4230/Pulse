import { useQuery } from "@tanstack/react-query"

import type {
  IntegrationId,
  IntegrationStatus,
} from "@/features/integrations/core/types"

export type IntegrationsStatusResponse = {
  integrations: Record<IntegrationId, IntegrationStatus>
}

async function fetchIntegrationStatus() {
  const response = await fetch("/api/integrations/status")

  if (!response.ok) {
    throw new Error("Failed to load integrations")
  }

  return response.json() as Promise<IntegrationsStatusResponse>
}

export function useIntegrationsStatus() {
  return useQuery({
    queryKey: ["integrations", "status"],
    queryFn: fetchIntegrationStatus,
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
  })
}
