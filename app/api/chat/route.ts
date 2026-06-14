import { createVercelAiMcpClient } from "@corsair-dev/mcp"
import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  type UIMessage,
} from "ai"

import { auth } from "@/lib/auth"
import { gmailRawGetProfile } from "@/features/inbox/server/gmail-raw"
import { getAppBaseUrl } from "@/features/integrations/core/lib/oauth"
import {
  ensureCorsairTenant,
  getIntegrationStatuses,
} from "@/features/integrations/core/server/tenant"
import {
  buildPulseSystemPrompt,
  PULSE_CHAT_MODEL,
} from "@/features/pulse/server/ai"
import { createPulseTools } from "@/features/pulse/server/tools"
import { getUserLocale } from "@/features/user/server/get-user-locale"

export const maxDuration = 60

async function resolveSenderEmail(tenantId: string, fallbackEmail: string) {
  try {
    const profile = await gmailRawGetProfile(tenantId)
    return profile.emailAddress?.trim() || fallbackEmail
  } catch {
    return fallbackEmail
  }
}

export async function POST(req: Request) {
  const session = await auth.api.getSession({
    headers: req.headers,
  })

  if (!session) {
    return new Response("Unauthorized", { status: 401 })
  }

  const tenantId = session.user.id
  const { messages }: { messages: UIMessage[] } = await req.json()

  await ensureCorsairTenant(tenantId)
  const integrations = await getIntegrationStatuses(tenantId)

  const hasConnectedIntegration =
    integrations.gmail === "connected" ||
    integrations.googlecalendar === "connected"

  let mcpClient: Awaited<ReturnType<typeof createVercelAiMcpClient>> | undefined

  try {
    const senderEmail = await resolveSenderEmail(tenantId, session.user.email)
    const locale = await getUserLocale(tenantId)

    const pulseTools = createPulseTools({
      tenantId,
      senderEmail,
      integrations,
      locale,
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
          return { ...pulseTools, ...mcpTools }
        })()
      : pulseTools

    const tools =
      Object.keys(mergedTools).length > 0
        ? (mergedTools as NonNullable<Parameters<typeof streamText>[0]["tools"]>)
        : undefined

    const system = mcpClient?.instructions
      ? `${buildPulseSystemPrompt(integrations, locale)}\n\n${mcpClient.instructions}`
      : buildPulseSystemPrompt(integrations, locale)

    const result = streamText({
      model: PULSE_CHAT_MODEL,
      system,
      messages: await convertToModelMessages(messages),
      tools,
      stopWhen: stepCountIs(15),
      onFinish: async () => {
        await mcpClient?.close()
      },
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    await mcpClient?.close()
    throw error
  }
}
