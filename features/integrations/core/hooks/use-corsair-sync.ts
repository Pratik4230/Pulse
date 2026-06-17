"use client"

import { useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"

type SyncMessage = {
  scope: "inbox" | "calendar" | "all"
  at: number
}

export function useCorsairSync(enabled = true) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!enabled) return

    const source = new EventSource("/api/integrations/sync")

    source.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as SyncMessage

        if (data.scope === "inbox" || data.scope === "all") {
          void queryClient.invalidateQueries({ queryKey: ["inbox"] })
        }

        if (data.scope === "calendar" || data.scope === "all") {
          void queryClient.invalidateQueries({ queryKey: ["calendar"] })
        }
      } catch {
        // Ignore malformed SSE payloads.
      }
    }

    return () => {
      source.close()
    }
  }, [enabled, queryClient])
}
