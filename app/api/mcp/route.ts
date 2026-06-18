import { getSessionFromRequest } from "@/features/integrations/core/server/session"
import { handleMcpRequest } from "@/features/pulse/server/mcp"
import { userRateLimitResponse } from "@/lib/rate-limit"

export const runtime = "nodejs"
export const maxDuration = 60

async function withAuth(request: Request) {
  const session = await getSessionFromRequest(request)
  if (!session) {
    return new Response("Unauthorized", { status: 401 })
  }

  const limited = await userRateLimitResponse(session.user.id, "mcp")
  if (limited) {
    return limited
  }

  return handleMcpRequest(request, session.user.id)
}

export async function GET(request: Request) {
  return withAuth(request)
}

export async function POST(request: Request) {
  return withAuth(request)
}

export async function DELETE(request: Request) {
  return withAuth(request)
}
