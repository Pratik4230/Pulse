import { convertToModelMessages, streamText, type UIMessage } from "ai"

import { auth } from "@/lib/auth"
import { PULSE_CHAT_MODEL, PULSE_SYSTEM_PROMPT } from "@/features/pulse/server/ai"

export const maxDuration = 60

export async function POST(req: Request) {
  const session = await auth.api.getSession({
    headers: req.headers,
  })

  if (!session) {
    return new Response("Unauthorized", { status: 401 })
  }

  const { messages }: { messages: UIMessage[] } = await req.json()

  const result = streamText({
    model: PULSE_CHAT_MODEL,
    system: PULSE_SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
  })

  return result.toUIMessageStreamResponse()
}
