import { setupCorsair } from "corsair/setup"
import { eq } from "drizzle-orm"

import { db } from "@/db"
import { corsairAccounts, corsairIntegrations } from "@/db/schema/corsair"
import { corsair } from "@/features/integrations/core/corsair/corsair"
import type {
  IntegrationId,
  IntegrationStatus,
} from "@/features/integrations/core/types"

export type { IntegrationId, IntegrationStatus }

const PLUGIN_IDS: IntegrationId[] = ["gmail", "googlecalendar"]

const ensuredTenants = new Set<string>()

const statusCache = new Map<
  string,
  { value: Record<IntegrationId, IntegrationStatus>; expiresAt: number }
>()
const STATUS_CACHE_TTL_MS = 5 * 60_000

export async function ensureCorsairTenant(tenantId: string) {
  if (ensuredTenants.has(tenantId)) {
    return
  }

  await setupCorsair(corsair, { tenantId })
  ensuredTenants.add(tenantId)
}

export async function getIntegrationStatuses(
  tenantId: string,
): Promise<Record<IntegrationId, IntegrationStatus>> {
  const cached = statusCache.get(tenantId)
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value
  }

  const rows = await db
    .select({
      name: corsairIntegrations.name,
      dek: corsairAccounts.dek,
    })
    .from(corsairAccounts)
    .innerJoin(
      corsairIntegrations,
      eq(corsairAccounts.integrationId, corsairIntegrations.id),
    )
    .where(eq(corsairAccounts.tenantId, tenantId))

  const dekByPlugin = new Map(rows.map((row) => [row.name, row.dek]))

  const value = {
    gmail: pluginStatus(dekByPlugin.get("gmail")),
    googlecalendar: pluginStatus(dekByPlugin.get("googlecalendar")),
  } satisfies Record<IntegrationId, IntegrationStatus>

  statusCache.set(tenantId, {
    value,
    expiresAt: Date.now() + STATUS_CACHE_TTL_MS,
  })

  return value
}

function pluginStatus(dek: string | null | undefined): IntegrationStatus {
  return dek ? "connected" : "not_connected"
}

export function invalidateIntegrationStatusCache(tenantId: string) {
  statusCache.delete(tenantId)
}
