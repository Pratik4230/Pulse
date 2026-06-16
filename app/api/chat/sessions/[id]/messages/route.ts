import { auth } from "@/lib/auth"
import { listChatMessagesPage } from "@/features/pulse/server/chat-store"

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(req: Request, context: RouteContext) {
  const session = await auth.api.getSession({ headers: req.headers })
  if (!session) {
    return new Response("Unauthorized", { status: 401 })
  }

  const { id } = await context.params
  const { searchParams } = new URL(req.url)
  const beforeRaw = searchParams.get("before")
  const limitRaw = searchParams.get("limit")

  const beforeSequence =
    beforeRaw != null && beforeRaw !== "" ? Number(beforeRaw) : undefined
  const limit =
    limitRaw != null && limitRaw !== "" ? Number(limitRaw) : undefined

  if (
    beforeSequence != null &&
    (Number.isNaN(beforeSequence) || beforeSequence < 0)
  ) {
    return Response.json({ error: "Invalid before cursor" }, { status: 400 })
  }

  if (limit != null && (Number.isNaN(limit) || limit < 1 || limit > 100)) {
    return Response.json({ error: "Invalid limit" }, { status: 400 })
  }

  try {
    const page = await listChatMessagesPage(session.user.id, id, {
      beforeSequence,
      limit,
    })
    return Response.json(page)
  } catch {
    return Response.json({ error: "Chat not found" }, { status: 404 })
  }
}
