import { processWebhook } from "corsair"
import { and, eq, inArray, isNotNull } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

import { db } from "@/db"
import { corsairAccounts, corsairIntegrations } from "@/db/schema/corsair"
import { corsair } from "@/features/integrations/core/corsair/corsair"

function headersFromRequest(request: NextRequest) {
  const headers: Record<string, string> = {}
  request.headers.forEach((value, key) => {
    headers[key] = value
  })
  return headers
}

async function bodyFromRequest(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? ""

  if (contentType.includes("application/json")) {
    // Pub/Sub (and some webhook retries) can occasionally deliver an empty body
    // with a JSON content-type. `request.json()` would throw "Unexpected end of JSON input".
    const text = await request.text()
    if (!text.trim()) return {}
    try {
      return JSON.parse(text) as Record<string, unknown>
    } catch {
      return { raw: text }
    }
  }

  return request.text()
}

async function listWebhookTenantCandidates() {
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

async function processForTenant(
  tenantId: string,
  headers: Record<string, string>,
  body: string | Record<string, unknown>,
) {
  const result = await processWebhook(corsair, headers, body, { tenantId })
  const isMatched = Boolean(result.plugin)
  const isSuccess =
    !isMatched ||
    !result.response ||
    typeof result.response !== "object" ||
    !("success" in result.response) ||
    result.response.success !== false

  return { tenantId, result, isMatched, isSuccess }
}

export async function POST(request: NextRequest) {
  const headers = headersFromRequest(request)
  const rawBody = await bodyFromRequest(request)
  const body =
    typeof rawBody === "string"
      ? rawBody
      : (rawBody as Record<string, unknown>)
  const requestedTenantId = new URL(request.url).searchParams.get("tenantId")

  const attempts = requestedTenantId
    ? [requestedTenantId]
    : await listWebhookTenantCandidates()

  for (const tenantId of attempts) {
    const { result, isMatched, isSuccess } = await processForTenant(
      tenantId,
      headers,
      body,
    )

    if (result.responseHeaders) {
      return new NextResponse(
        result.response ? JSON.stringify(result.response) : null,
        {
          status: result.response ? 200 : 204,
          headers: result.responseHeaders,
        },
      )
    }

    if (isMatched && isSuccess) {
      return NextResponse.json(result.response ?? { success: true })
    }
  }

  return NextResponse.json({ success: false }, { status: 404 })
}
