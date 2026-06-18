import { useQuery } from "@tanstack/react-query"

import type { AiUsageSnapshot } from "@/lib/billing/ai-usage"

async function fetchAiUsage(): Promise<AiUsageSnapshot> {
  const response = await fetch("/api/chat/usage")

  if (!response.ok) {
    throw new Error("Could not load AI usage")
  }

  return response.json() as Promise<AiUsageSnapshot>
}

export function useAiUsage() {
  return useQuery({
    queryKey: ["ai-usage"],
    queryFn: fetchAiUsage,
    staleTime: 30_000,
  })
}
