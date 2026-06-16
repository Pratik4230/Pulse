import { createVercelAiMcpClient } from "@corsair-dev/mcp"
import { openai } from "@ai-sdk/openai"
import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  type UIMessage,
} from "ai"

import { auth } from "@/lib/auth"
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
  resolveModelMessages,
  saveChatMessages,
} from "@/features/pulse/server/chat-store"
import { getLatestUserMessageText } from "@/features/pulse/server/chat-messages"
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
  const {
    messages,
    sessionId,
  }: { messages: UIMessage[]; sessionId?: string } = await req.json()

  if (!sessionId?.trim()) {
    return Response.json({ error: "sessionId is required" }, { status: 400 })
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json({ error: "messages are required" }, { status: 400 })
  }

  const latestUserText = getLatestUserMessageText(messages)
  const titleCandidate = latestUserText?.slice(0, 48)

  await ensureChatSession(tenantId, sessionId, titleCandidate)
  await ensureCorsairTenant(tenantId)
  const integrations = await getIntegrationStatuses(tenantId)

  const hasConnectedIntegration =
    integrations.gmail === "connected" ||
    integrations.googlecalendar === "connected"

  let mcpClient: Awaited<ReturnType<typeof createVercelAiMcpClient>> | undefined

  try {
    const locale = await getUserLocale(tenantId)
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
      ? `${buildPulseSystemPrompt(integrations, locale)}\n\n${mcpClient.instructions}`
      : buildPulseSystemPrompt(integrations, locale)

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
