import { auth } from "@/lib/auth"
import { listChatMessagesPage } from "@/features/pulse/server/chat-store"
import {
  chatMessagesQuerySchema,
  chatRouteParamsSchema,
} from "@/features/pulse/validations"
import { userRateLimitResponse } from "@/lib/rate-limit"

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(req: Request, context: RouteContext) {
  const session = await auth.api.getSession({ headers: req.headers })
  if (!session) {
    return new Response("Unauthorized", { status: 401 })
  }

  const limited = await userRateLimitResponse(session.user.id, "api-read")
  if (limited) {
    return limited
  }

  const parsedParams = chatRouteParamsSchema.safeParse(await context.params)
  if (!parsedParams.success) {
    return Response.json({ error: "Invalid chat id" }, { status: 400 })
  }
  const { id } = parsedParams.data
  const { searchParams } = new URL(req.url)
  const parsedQuery = chatMessagesQuerySchema.safeParse({
    before: searchParams.get("before") ?? undefined,
    limit: searchParams.get("limit") ?? undefined,
  })
  if (!parsedQuery.success) {
    return Response.json({ error: "Invalid message query" }, { status: 400 })
  }
  const { before: beforeSequence, limit } = parsedQuery.data

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
