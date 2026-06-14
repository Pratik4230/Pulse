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

const ensuredTenants = new Set<string>()

type OAuthKeys = {
  get_refresh_token: () => Promise<string | null>
}

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
    gmail: await oauthPluginStatus(tenantId, "gmail", dekByPlugin.get("gmail")),
    googlecalendar: await oauthPluginStatus(
      tenantId,
      "googlecalendar",
      dekByPlugin.get("googlecalendar"),
    ),
  } satisfies Record<IntegrationId, IntegrationStatus>

  statusCache.set(tenantId, {
    value,
    expiresAt: Date.now() + STATUS_CACHE_TTL_MS,
  })

  return value
}

async function oauthPluginStatus(
  tenantId: string,
  pluginId: IntegrationId,
  dek: string | null | undefined,
): Promise<IntegrationStatus> {
  if (!dek) return "not_connected"

  await ensureCorsairTenant(tenantId)

  const keys = getOAuthKeys(tenantId, pluginId)
  const refreshToken = await keys.get_refresh_token()

  return refreshToken ? "connected" : "missing_credentials"
}

function getOAuthKeys(tenantId: string, pluginId: IntegrationId): OAuthKeys {
  const client = corsair.withTenant(tenantId)
  return (pluginId === "gmail" ? client.gmail.keys : client.googlecalendar
    .keys) as OAuthKeys
}

export function invalidateIntegrationStatusCache(tenantId: string) {
  statusCache.delete(tenantId)
}
