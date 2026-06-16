export const CHAT_MESSAGE_PAGE_SIZE = 30
export const CHAT_MODEL_RECENT_LIMIT = 21

export type ChatSessionListItem = {
  id: string
  title: string
  messageCount: number
  updatedAt: string
  createdAt: string
}

export type ChatMessagesPage = {
  messages: import("ai").UIMessage[]
  hasMore: boolean
  oldestSequence: number | null
}
