import { and, eq, inArray, isNotNull, sql } from "drizzle-orm"

import { db } from "@/db"
import { user } from "@/db/schema/auth"
import { corsairAccounts, corsairIntegrations } from "@/db/schema/corsair"

type PubSubPushBody = {
  message?: {
    data?: string
  }
}

type GmailPushData = {
  emailAddress?: string
  historyId?: string
}

export function extractGmailPubSubEmail(
  body: string | Record<string, unknown>,
): string | null {
  try {
    const payload =
      typeof body === "string"
        ? (JSON.parse(body) as PubSubPushBody)
        : (body as PubSubPushBody)

    const encoded = payload.message?.data
    if (!encoded) return null

    const decoded = Buffer.from(encoded, "base64").toString("utf8")
    const data = JSON.parse(decoded) as GmailPushData
    const email = data.emailAddress?.trim().toLowerCase()

    return email || null
  } catch {
    return null
  }
}

export async function resolveTenantIdByEmail(email: string) {
  const normalized = email.trim().toLowerCase()

  const rows = await db
    .select({ id: user.id })
    .from(user)
    .where(sql`lower(${user.email}) = ${normalized}`)
    .limit(1)

  return rows[0]?.id ?? null
}

export async function listWebhookTenantCandidates() {
  const rows = await db
    .select({ tenantId: corsairAccounts.tenantId })
    .from(corsairAccounts)
    .innerJoin(
      corsairIntegrations,
      eq(corsairAccounts.integrationId, corsairIntegrations.id),
    )
    .where(
      and(
        inArray(corsairIntegrations.name, ["gmail", "googlecalendar"]),
        isNotNull(corsairAccounts.dek),
      ),
    )

  return [...new Set(rows.map((row) => row.tenantId))]
}

export async function tenantHasConnectedGmail(tenantId: string) {
  const rows = await db
    .select({ dek: corsairAccounts.dek })
    .from(corsairAccounts)
    .innerJoin(
      corsairIntegrations,
      eq(corsairAccounts.integrationId, corsairIntegrations.id),
    )
    .where(
      and(
        eq(corsairAccounts.tenantId, tenantId),
        eq(corsairIntegrations.name, "gmail"),
        isNotNull(corsairAccounts.dek),
      ),
    )
    .limit(1)

  return rows.length > 0
}

export async function resolveWebhookTenantAttempts(
  body: string | Record<string, unknown>,
  requestedTenantId: string | null,
) {
  if (requestedTenantId) {
    return [requestedTenantId]
  }

  const gmailEmail = extractGmailPubSubEmail(body)
  if (gmailEmail) {
    const tenantId = await resolveTenantIdByEmail(gmailEmail)
    if (!tenantId) {
      return []
    }

    const hasGmail = await tenantHasConnectedGmail(tenantId)
    return hasGmail ? [tenantId] : []
  }

  return listWebhookTenantCandidates()
}
