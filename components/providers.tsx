"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"

import { useCorsairSync } from "@/features/integrations/core/hooks/use-corsair-sync"

function CorsairSyncListener() {
  useCorsairSync()
  return null
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      <CorsairSyncListener />
      {children}
    </QueryClientProvider>
  )
}
