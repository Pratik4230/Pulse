export type InboxFilter = "all" | "unread"

export type InboxListItem = {
  id: string
  threadId: string
  from: string
  subject: string
  snippet: string
  date: string
  isUnread: boolean
  enriched: boolean
}

export type InboxListPage = {
  messages: InboxListItem[]
  nextPageToken: string | null
  filter: InboxFilter
}

export type InboxMessageDetail = Omit<InboxListItem, "enriched"> & {
  to: string
  /** Plain-text body (fallback / accessibility). */
  body: string
  /** Raw HTML body when the email is HTML. */
  bodyHtml?: string
}

export type InboxThreadDetail = {
  threadId: string
  subject: string
  focusedMessageId: string
  messageCount: number
  messages: InboxMessageDetail[]
}
