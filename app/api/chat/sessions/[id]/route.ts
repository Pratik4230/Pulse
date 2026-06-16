import { auth } from "@/lib/auth"
import {
  deleteChatSession,
  getChatSessionForUser,
} from "@/features/pulse/server/chat-store"

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function DELETE(_req: Request, context: RouteContext) {
  const session = await auth.api.getSession({ headers: _req.headers })
  if (!session) {
    return new Response("Unauthorized", { status: 401 })
  }

  const { id } = await context.params
  const existing = await getChatSessionForUser(session.user.id, id)
  if (!existing) {
    return Response.json({ error: "Chat not found" }, { status: 404 })
  }

  await deleteChatSession(session.user.id, id)
  return new Response(null, { status: 204 })
}
