"use client"

import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query"
import { useState } from "react"

import { useCorsairSync } from "@/features/integrations/core/hooks/use-corsair-sync"
import { isRateLimitError, notifyRateLimitError } from "@/lib/api-client"

function handleRateLimitError(error: unknown) {
  if (isRateLimitError(error)) {
    notifyRateLimitError(error)
  }
}

function createQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: handleRateLimitError,
    }),
    mutationCache: new MutationCache({
      onError: handleRateLimitError,
    }),
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        retry: (failureCount, error) =>
          !isRateLimitError(error) && failureCount < 2,
      },
    },
  })
}

function CorsairSyncListener() {
  useCorsairSync()
  return null
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => createQueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <CorsairSyncListener />
      {children}
    </QueryClientProvider>
  )
}
