import { and, asc, eq, gt } from "drizzle-orm"

import { db } from "@/db"
import { corsairAccounts, corsairEvents } from "@/db/schema/corsair"

import {
  broadcastSyncInvalidation,
  syncScopeForEventType,
  type SyncScope,
} from "./sync-broadcast"

export async function listSyncEventsSince(
  tenantId: string,
  since: Date,
) {
  const rows = await db
    .select({
      eventType: corsairEvents.eventType,
      createdAt: corsairEvents.createdAt,
    })
    .from(corsairEvents)
    .innerJoin(corsairAccounts, eq(corsairEvents.accountId, corsairAccounts.id))
    .where(
      and(
        eq(corsairAccounts.tenantId, tenantId),
        gt(corsairEvents.createdAt, since),
      ),
    )
    .orderBy(asc(corsairEvents.createdAt))

  return rows
}

export function scopesFromEventTypes(eventTypes: string[]): SyncScope[] {
  const scopes = new Set<SyncScope>()

  for (const eventType of eventTypes) {
    const scope = syncScopeForEventType(eventType)
    if (scope) scopes.add(scope)
  }

  return [...scopes]
}

export async function pollAndBroadcastSyncEvents(
  tenantId: string,
  since: Date,
) {
  const rows = await listSyncEventsSince(tenantId, since)
  if (rows.length === 0) return since

  const scopes = scopesFromEventTypes(rows.map((row) => row.eventType))
  for (const scope of scopes) {
    broadcastSyncInvalidation(tenantId, scope)
  }

  return rows.at(-1)?.createdAt ?? since
}
