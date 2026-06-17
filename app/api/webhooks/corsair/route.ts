import { processWebhook } from "corsair"
import { NextRequest, NextResponse } from "next/server"

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
    return request.json()
  }

  return request.text()
}

export async function POST(request: NextRequest) {
  const headers = headersFromRequest(request)
  const body = await bodyFromRequest(request)
  const tenantId =
    new URL(request.url).searchParams.get("tenantId") ?? undefined

  const result = await processWebhook(corsair, headers, body, { tenantId })

  if (result.responseHeaders) {
    return new NextResponse(
      result.response ? JSON.stringify(result.response) : null,
      {
        status: result.response ? 200 : 204,
        headers: result.responseHeaders,
      },
    )
  }

  if (!result.plugin) {
    return NextResponse.json({ success: false }, { status: 404 })
  }

  return NextResponse.json(result.response ?? { success: true })
}
