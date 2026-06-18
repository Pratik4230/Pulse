import { useQuery } from "@tanstack/react-query"

import type { AiUsageSnapshot } from "@/lib/billing/ai-usage"
import { fetchJson } from "@/lib/api-client"

async function fetchAiUsage(): Promise<AiUsageSnapshot> {
  return fetchJson<AiUsageSnapshot>("/api/chat/usage")
}

export function useAiUsage() {
  return useQuery({
    queryKey: ["ai-usage"],
    queryFn: fetchAiUsage,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  })
}
