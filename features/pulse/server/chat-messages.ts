export function getMessageText(message: {
  role: string
  parts: { type: string; text?: string }[]
}) {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text ?? "")
    .join("")
    .trim()
}

export function getLatestUserMessageText(
  messages: { role: string; parts: { type: string; text?: string }[] }[],
) {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index]
    if (message.role !== "user") continue
    const text = getMessageText(message)
    if (text) return text
  }
  return null
}

export function getRecentConversationText(
  messages: { role: string; parts: { type: string; text?: string }[] }[],
  limit = 8,
) {
  return messages
    .slice(-limit)
    .map((message) => getMessageText(message))
    .filter(Boolean)
    .join("\n")
}
