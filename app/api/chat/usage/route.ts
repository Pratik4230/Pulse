import { auth } from "@/lib/auth"
import { getDailyAiUsage } from "@/lib/billing/ai-usage"
import { getUserLocale } from "@/features/user/server/get-user-locale"

export async function GET(req: Request) {
  const session = await auth.api.getSession({
    headers: req.headers,
  })

  if (!session) {
    return new Response("Unauthorized", { status: 401 })
  }

  const locale = await getUserLocale(session.user.id)
  const plan =
    typeof session.user.plan === "string" ? session.user.plan : "free"
  const usage = await getDailyAiUsage(session.user.id, locale.timezone, plan)

  return Response.json(usage)
}
