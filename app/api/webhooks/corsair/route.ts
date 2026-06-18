import { processWebhook } from "corsair"
import { NextRequest, NextResponse } from "next/server"

import { corsair } from "@/features/integrations/core/corsair/corsair"
import {
  extractGmailPubSubEmail,
  resolveWebhookTenantAttempts,
} from "@/features/integrations/core/server/webhook-tenant"

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

  const attempts = await resolveWebhookTenantAttempts(body, requestedTenantId)

  if (attempts.length === 0) {
    const gmailEmail = extractGmailPubSubEmail(body)
    if (gmailEmail) {
      // Ack Pub/Sub for unknown or disconnected mailboxes to avoid retries.
      return NextResponse.json({
        success: true,
        skipped: true,
        reason: "no_matching_tenant",
        emailAddress: gmailEmail,
      })
    }

    return NextResponse.json({ success: false }, { status: 404 })
  }

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
