import { auth } from "@/lib/auth"
import {
  deleteChatSession,
  getChatSessionForUser,
} from "@/features/pulse/server/chat-store"
import { chatRouteParamsSchema } from "@/features/pulse/validations"

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function DELETE(_req: Request, context: RouteContext) {
  const session = await auth.api.getSession({ headers: _req.headers })
  if (!session) {
    return new Response("Unauthorized", { status: 401 })
  }

  const parsedParams = chatRouteParamsSchema.safeParse(await context.params)
  if (!parsedParams.success) {
    return Response.json({ error: "Invalid chat id" }, { status: 400 })
  }
  const { id } = parsedParams.data
  const existing = await getChatSessionForUser(session.user.id, id)
  if (!existing) {
    return Response.json({ error: "Chat not found" }, { status: 404 })
  }

  await deleteChatSession(session.user.id, id)
  return new Response(null, { status: 204 })
}
