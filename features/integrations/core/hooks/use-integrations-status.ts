import { useQuery } from "@tanstack/react-query"

import type {
  IntegrationId,
  IntegrationStatus,
} from "@/features/integrations/core/types"
import { fetchJson } from "@/lib/api-client"

export type IntegrationsStatusResponse = {
  integrations: Record<IntegrationId, IntegrationStatus>
}

async function fetchIntegrationStatus() {
  return fetchJson<IntegrationsStatusResponse>("/api/integrations/status")
}

export function useIntegrationsStatus() {
  return useQuery({
    queryKey: ["integrations", "status"],
    queryFn: fetchIntegrationStatus,
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
  })
}
