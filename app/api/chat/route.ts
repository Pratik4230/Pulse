import { createVercelAiMcpClient } from "@corsair-dev/mcp"
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

export const maxDuration = 60

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
    const tools = hasConnectedIntegration
      ? await (async () => {
          mcpClient = await createVercelAiMcpClient({
            url: `${getAppBaseUrl()}/api/mcp`,
            headers: {
              cookie: req.headers.get("cookie") ?? "",
            },
          })
          return mcpClient.tools()
        })()
      : undefined

    const system = mcpClient?.instructions
      ? `${buildPulseSystemPrompt(integrations)}\n\n${mcpClient.instructions}`
      : buildPulseSystemPrompt(integrations)

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
