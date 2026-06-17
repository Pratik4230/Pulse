export type SyncScope = "inbox" | "calendar" | "all"

type SyncListener = {
  controller: ReadableStreamDefaultController<Uint8Array>
  encoder: TextEncoder
}

const listenersByTenant = new Map<string, Set<SyncListener>>()

function getTenantListeners(tenantId: string) {
  let listeners = listenersByTenant.get(tenantId)
  if (!listeners) {
    listeners = new Set()
    listenersByTenant.set(tenantId, listeners)
  }
  return listeners
}

export function subscribeSyncBroadcast(
  tenantId: string,
  listener: SyncListener,
) {
  getTenantListeners(tenantId).add(listener)
}

export function unsubscribeSyncBroadcast(
  tenantId: string,
  listener: SyncListener,
) {
  const listeners = listenersByTenant.get(tenantId)
  if (!listeners) return

  listeners.delete(listener)
  if (listeners.size === 0) {
    listenersByTenant.delete(tenantId)
  }
}

export function broadcastSyncInvalidation(
  tenantId: string,
  scope: SyncScope,
  at = Date.now(),
) {
  const listeners = listenersByTenant.get(tenantId)
  if (!listeners?.size) return

  const payload = JSON.stringify({ scope, at })
  const message = `id: ${at}\ndata: ${payload}\n\n`
  const encoded = new TextEncoder().encode(message)

  for (const listener of listeners) {
    try {
      listener.controller.enqueue(encoded)
    } catch {
      listeners.delete(listener)
    }
  }
}

export function syncScopeForEventType(eventType: string): SyncScope | null {
  if (eventType.startsWith("gmail.webhook")) return "inbox"
  if (eventType.startsWith("googlecalendar.webhook")) return "calendar"
  return null
}
