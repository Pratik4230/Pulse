import type {
  InboxFilter,
  InboxListItem,
  InboxListPage,
  InboxMessageDetail,
  InboxThreadDetail,
} from "../types"
import {
  gmailRawGetMessage,
  gmailRawGetThread,
  gmailRawListMessages,
} from "./gmail-raw"
import {
  extractMessageContent,
  formatMessageDate,
  getHeader,
  getMessageInternalTime,
  parseSender,
  toListItem,
  type GmailMessage,
} from "./parse-message"

const INBOX_PAGE_SIZE = 12
const SYNC_CONCURRENCY = 8
const LIST_METADATA_HEADERS = ["From", "Subject", "Date"]

function apiMessageToListItem(
  message: GmailMessage,
  filter: InboxFilter,
): InboxListItem | null {
  const item = toListItem(message)
  if (!item || !item.enriched) return null

  return {
    ...item,
    isUnread: filter === "unread" || item.isUnread,
  }
}

function stubToListItem(
  stub: GmailMessage,
  filter: InboxFilter,
): InboxListItem | null {
  if (!stub.id) return null

  return {
    id: stub.id,
    threadId: stub.threadId ?? stub.id,
    from: "",
    subject: "",
    snippet: stub.snippet ?? "",
    date: stub.internalDate
      ? formatMessageDate("", stub.internalDate)
      : "",
    isUnread:
      filter === "unread" || (stub.labelIds?.includes("UNREAD") ?? false),
    enriched: false,
  }
}

function gmailMessageToDetail(message: GmailMessage): InboxMessageDetail | null {
  const item = toListItem(message)
  if (!item) return null

  const headers = message.payload?.headers
  const content = extractMessageContent(message.payload)

  return {
    id: item.id,
    threadId: item.threadId,
    from: item.from,
    subject: item.subject,
    snippet: item.snippet,
    date: item.date,
    isUnread: item.isUnread,
    to: parseSender(getHeader(headers, "To")) || getHeader(headers, "To"),
    body: content.text || message.snippet || "",
    bodyHtml: content.html || undefined,
  }
}

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  mapper: (item: T) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length)
  let index = 0

  async function worker() {
    while (index < items.length) {
      const current = index++
      results[current] = await mapper(items[current])
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, worker),
  )

  return results
}

async function fetchListMetadata(
  tenantId: string,
  ids: string[],
  filter: InboxFilter,
): Promise<InboxListItem[]> {
  if (ids.length === 0) return []

  const fetched = await mapWithConcurrency(ids, SYNC_CONCURRENCY, (id) =>
    gmailRawGetMessage(tenantId, {
      id,
      format: "metadata",
      metadataHeaders: LIST_METADATA_HEADERS,
    }),
  )

  return fetched.flatMap((message) => {
    const item = apiMessageToListItem(message, filter)
    return item ? [item] : []
  })
}

export async function enrichInboxListItems(
  tenantId: string,
  ids: string[],
  filter: InboxFilter,
): Promise<InboxListItem[]> {
  return fetchListMetadata(tenantId, ids, filter)
}

function buildInboxQuery(filter: InboxFilter, search?: string) {
  const parts: string[] = []
  if (filter === "unread") parts.push("is:unread")

  const trimmed = search?.trim()
  if (trimmed) parts.push(trimmed)

  return parts.length > 0 ? parts.join(" ") : undefined
}

export async function listInboxPage(
  tenantId: string,
  filter: InboxFilter,
  pageToken?: string,
  search?: string,
): Promise<InboxListPage> {
  const listResponse = await gmailRawListMessages(tenantId, {
    labelIds: ["INBOX"],
    maxResults: INBOX_PAGE_SIZE,
    pageToken,
    q: buildInboxQuery(filter, search),
  })

  const messages = (listResponse.messages ?? [])
    .map((stub) => stubToListItem(stub, filter))
    .filter((item): item is InboxListItem => item !== null)

  return {
    messages,
    nextPageToken: listResponse.nextPageToken ?? null,
    filter,
  }
}

export async function getInboxThread(
  tenantId: string,
  messageId: string,
): Promise<InboxThreadDetail | null> {
  const focusMessage = await gmailRawGetMessage(tenantId, {
    id: messageId,
    format: "minimal",
  })

  const threadId = focusMessage.threadId ?? messageId
  const thread = await gmailRawGetThread(tenantId, {
    id: threadId,
    format: "full",
  })

  const sortedMessages = [...(thread.messages ?? [])].sort(
    (a, b) => getMessageInternalTime(a) - getMessageInternalTime(b),
  )

  const messages = sortedMessages
    .map((message) => gmailMessageToDetail(message))
    .filter((message): message is InboxMessageDetail => message !== null)

  if (messages.length === 0) return null

  const subject =
    messages.find((message) => message.id === messageId)?.subject ??
    messages[messages.length - 1]?.subject ??
    "(No subject)"

  return {
    threadId,
    subject,
    focusedMessageId: messageId,
    messageCount: messages.length,
    messages,
  }
}

/** @deprecated Use getInboxThread, kept for compatibility. */
export async function getInboxMessage(
  tenantId: string,
  messageId: string,
): Promise<InboxMessageDetail | null> {
  const thread = await getInboxThread(tenantId, messageId)
  if (!thread) return null

  return (
    thread.messages.find((message) => message.id === messageId) ??
    thread.messages[thread.messages.length - 1] ??
    null
  )
}
