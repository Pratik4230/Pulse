import { createVercelAiMcpClient } from "@corsair-dev/mcp"
import { openai } from "@ai-sdk/openai"
import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  type UIMessage,
} from "ai"

import { auth } from "@/lib/auth"
import {
  AI_DAILY_LIMIT_ERROR_CODE,
  countNewUserTurns,
  reserveDailyAiMessages,
} from "@/lib/billing/ai-usage"
import { getAppBaseUrl } from "@/features/integrations/core/lib/oauth"
import {
  ensureCorsairTenant,
  getIntegrationStatuses,
} from "@/features/integrations/core/server/tenant"
import {
  buildPulseSystemPrompt,
  PULSE_CHAT_MODEL,
} from "@/features/pulse/server/ai"
import {
  ensureChatSession,
  getChatSessionForUser,
  resolveModelMessages,
  saveChatMessages,
} from "@/features/pulse/server/chat-store"
import { getLatestUserMessageText } from "@/features/pulse/server/chat-messages"
import {
  CHAT_MAX_MESSAGE_CHARS,
  chatPostBodySchema,
} from "@/features/pulse/validations"
import { getUserLocale } from "@/features/user/server/get-user-locale"

export const maxDuration = 60

export async function POST(req: Request) {
  const session = await auth.api.getSession({
    headers: req.headers,
  })

  if (!session) {
    return new Response("Unauthorized", { status: 401 })
  }

  const tenantId = session.user.id
  const parsedBody = chatPostBodySchema.safeParse(await req.json())
  if (!parsedBody.success) {
    return Response.json({ error: "Invalid chat request" }, { status: 400 })
  }
  const { messages, sessionId } = parsedBody.data as {
    messages: UIMessage[]
    sessionId: string
  }

  const latestUserText = getLatestUserMessageText(messages)
  if (latestUserText && latestUserText.length > CHAT_MAX_MESSAGE_CHARS) {
    return Response.json(
      {
        error: `Message is too long. Maximum ${CHAT_MAX_MESSAGE_CHARS} characters.`,
      },
      { status: 400 },
    )
  }

  const titleCandidate = latestUserText?.slice(0, 48)

  const existingSession = await getChatSessionForUser(tenantId, sessionId)
  const newUserTurns = countNewUserTurns(
    messages,
    existingSession?.messageCount ?? 0,
  )

  const locale = await getUserLocale(tenantId)
  const plan =
    typeof session.user.plan === "string" ? session.user.plan : "free"

  if (newUserTurns > 0) {
    const reservation = await reserveDailyAiMessages(
      tenantId,
      locale.timezone,
      plan,
      newUserTurns,
    )

    if (!reservation.ok) {
      return Response.json(
        {
          error: `Free plan includes ${reservation.limit} Pulse AI messages per day. Upgrade to Pro for unlimited access.`,
          code: AI_DAILY_LIMIT_ERROR_CODE,
          used: reservation.used,
          limit: reservation.limit,
          remaining: reservation.remaining,
        },
        { status: 429 },
      )
    }
  }

  await ensureChatSession(tenantId, sessionId, titleCandidate)
  await ensureCorsairTenant(tenantId)
  const integrations = await getIntegrationStatuses(tenantId)

  const hasConnectedIntegration =
    integrations.gmail === "connected" ||
    integrations.googlecalendar === "connected"

  let mcpClient: Awaited<ReturnType<typeof createVercelAiMcpClient>> | undefined

  try {
    const modelMessages = await resolveModelMessages(
      tenantId,
      sessionId,
      messages,
    )

    const webSearchTool = openai.tools.webSearch({
      searchContextSize: "medium",
      userLocation: {
        type: "approximate",
        country: locale.country,
        timezone: locale.timezone,
      },
    })

    const mergedTools = hasConnectedIntegration
      ? await (async () => {
          mcpClient = await createVercelAiMcpClient({
            url: `${getAppBaseUrl()}/api/mcp`,
            headers: {
              cookie: req.headers.get("cookie") ?? "",
            },
          })
          const mcpTools = await mcpClient.tools()
          return { web_search: webSearchTool, ...mcpTools }
        })()
      : { web_search: webSearchTool }

    const tools =
      Object.keys(mergedTools).length > 0
        ? (mergedTools as NonNullable<Parameters<typeof streamText>[0]["tools"]>)
        : undefined

    const systemBase = mcpClient?.instructions
      ? `${buildPulseSystemPrompt(integrations, locale, {
          name: session.user.name ?? null,
          email: session.user.email ?? null,
        })}\n\n${mcpClient.instructions}`
      : buildPulseSystemPrompt(integrations, locale, {
          name: session.user.name ?? null,
          email: session.user.email ?? null,
        })

    const system = systemBase

    const result = streamText({
      model: PULSE_CHAT_MODEL,
      system,
      messages: await convertToModelMessages(modelMessages),
      tools,
      stopWhen: stepCountIs(20),
      providerOptions: {
        openai: {
          parallelToolCalls: false,
        },
      },
      onFinish: async () => {
        await mcpClient?.close()
      },
    })

    return result.toUIMessageStreamResponse({
      originalMessages: messages,
      onFinish: async ({ messages: finishedMessages }) => {
        const title =
          finishedMessages.length <= 2 && titleCandidate
            ? titleCandidate
            : undefined

        await saveChatMessages(tenantId, sessionId, finishedMessages, {
          title,
        })
      },
    })
  } catch (error) {
    await mcpClient?.close()
    throw error
  }
}
