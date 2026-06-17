import type { IntegrationId } from "@/features/integrations/core/types"

import {
  broadcastSyncInvalidation,
  type SyncScope,
} from "./sync-broadcast"

export function syncScopeForPlugin(plugin: IntegrationId): SyncScope {
  return plugin === "gmail" ? "inbox" : "calendar"
}

export function notifyWebhookSync(
  tenantId: string | undefined,
  plugin: IntegrationId,
) {
  if (!tenantId) return
  broadcastSyncInvalidation(tenantId, syncScopeForPlugin(plugin))
}
