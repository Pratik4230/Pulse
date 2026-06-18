import { auth } from "@/lib/auth"
import { listChatSessions } from "@/features/pulse/server/chat-store"
import { userRateLimitResponse } from "@/lib/rate-limit"

export async function GET(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers })
  if (!session) {
    return new Response("Unauthorized", { status: 401 })
  }

  const limited = await userRateLimitResponse(session.user.id, "api-read")
  if (limited) {
    return limited
  }

  const sessions = await listChatSessions(session.user.id)
  return Response.json({ sessions })
}
