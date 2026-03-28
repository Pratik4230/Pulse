import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"

export const maxDuration = 60

export async function POST(req: Request) {
  const { messages } = await req.json()

  const result = streamText({
    model: openai("gpt-4o-mini"),
    messages,
    system: "You are Pulse, a helpful AI assistant. Be concise and clear in your responses.",
  })

  return result.toDataStreamResponse()
}
