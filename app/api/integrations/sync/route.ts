import { getSessionFromRequest } from "@/features/integrations/core/server/session"
import { pollAndBroadcastSyncEvents } from "@/features/integrations/core/server/sync-events"
import {
  subscribeSyncBroadcast,
  unsubscribeSyncBroadcast,
} from "@/features/integrations/core/server/sync-broadcast"

const POLL_INTERVAL_MS = 2_000

export async function GET(request: Request) {
  const session = await getSessionFromRequest(request)
  if (!session) {
    return new Response("Unauthorized", { status: 401 })
  }

  const tenantId = session.user.id
  let lastSeen = new Date()
  let pollTimer: ReturnType<typeof setInterval> | undefined
  let listener:
    | {
        controller: ReadableStreamDefaultController<Uint8Array>
        encoder: TextEncoder
      }
    | undefined

  const cleanup = () => {
    if (pollTimer) {
      clearInterval(pollTimer)
      pollTimer = undefined
    }
    if (listener) {
      unsubscribeSyncBroadcast(tenantId, listener)
      listener = undefined
    }
  }

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      listener = {
        controller,
        encoder: new TextEncoder(),
      }

      subscribeSyncBroadcast(tenantId, listener)
      controller.enqueue(listener.encoder.encode(": connected\n\n"))

      pollTimer = setInterval(() => {
        void pollAndBroadcastSyncEvents(tenantId, lastSeen)
          .then((nextSeen) => {
            lastSeen = nextSeen
          })
          .catch(() => {
            // Ignore transient DB errors during polling.
          })
      }, POLL_INTERVAL_MS)

      request.signal.addEventListener("abort", cleanup)
    },
    cancel() {
      cleanup()
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  })
}
