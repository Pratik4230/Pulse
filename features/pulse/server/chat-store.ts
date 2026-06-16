import { type UIMessage } from "ai"
import { and, asc, desc, eq, gte, lt } from "drizzle-orm"

import { db } from "@/db"
import { chatMessages, chatSessions } from "@/db/schema/chat"
import {
  CHAT_MESSAGE_PAGE_SIZE,
  CHAT_MODEL_RECENT_LIMIT,
  type ChatMessagesPage,
  type ChatSessionListItem,
} from "@/features/pulse/types/chat"

function rowToUIMessage(row: {
  id: string
  role: string
  parts: unknown
}): UIMessage {
  return {
    id: row.id,
    role: row.role as UIMessage["role"],
    parts: row.parts as UIMessage["parts"],
  }
}

export async function listChatSessions(
  userId: string,
): Promise<ChatSessionListItem[]> {
  const rows = await db
    .select({
      id: chatSessions.id,
      title: chatSessions.title,
      messageCount: chatSessions.messageCount,
      updatedAt: chatSessions.updatedAt,
      createdAt: chatSessions.createdAt,
    })
    .from(chatSessions)
    .where(eq(chatSessions.userId, userId))
    .orderBy(desc(chatSessions.updatedAt))
    .limit(100)

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    messageCount: row.messageCount,
    updatedAt: row.updatedAt.toISOString(),
    createdAt: row.createdAt.toISOString(),
  }))
}

export async function getChatSessionForUser(
  userId: string,
  sessionId: string,
) {
  return db.query.chatSessions.findFirst({
    where: and(
      eq(chatSessions.id, sessionId),
      eq(chatSessions.userId, userId),
    ),
  })
}

export async function ensureChatSession(
  userId: string,
  sessionId: string,
  title?: string,
) {
  const existing = await getChatSessionForUser(userId, sessionId)
  if (existing) return existing

  const [created] = await db
    .insert(chatSessions)
    .values({
      id: sessionId,
      userId,
      title: title?.trim() || "New chat",
    })
    .returning()

  return created
}

export async function deleteChatSession(userId: string, sessionId: string) {
  const result = await db
    .delete(chatSessions)
    .where(
      and(eq(chatSessions.id, sessionId), eq(chatSessions.userId, userId)),
    )
    .returning({ id: chatSessions.id })

  return result.length > 0
}

export async function listChatMessagesPage(
  userId: string,
  sessionId: string,
  options?: { limit?: number; beforeSequence?: number },
): Promise<ChatMessagesPage> {
  const session = await getChatSessionForUser(userId, sessionId)
  if (!session) {
    throw new Error("Chat session not found")
  }

  const limit = options?.limit ?? CHAT_MESSAGE_PAGE_SIZE
  const beforeSequence = options?.beforeSequence

  const conditions = [eq(chatMessages.sessionId, sessionId)]
  if (beforeSequence != null) {
    conditions.push(lt(chatMessages.sequence, beforeSequence))
  }

  const rows = await db
    .select({
      id: chatMessages.id,
      role: chatMessages.role,
      parts: chatMessages.parts,
      sequence: chatMessages.sequence,
    })
    .from(chatMessages)
    .where(and(...conditions))
    .orderBy(desc(chatMessages.sequence))
    .limit(limit + 1)

  const hasMore = rows.length > limit
  const pageRows = hasMore ? rows.slice(0, limit) : rows
  pageRows.reverse()

  return {
    messages: pageRows.map(rowToUIMessage),
    hasMore,
    oldestSequence: pageRows[0]?.sequence ?? null,
  }
}

function stableMessageId(
  sessionId: string,
  message: UIMessage,
  sequence: number,
) {
  const trimmed = message.id?.trim()
  if (trimmed) return trimmed
  return `${sessionId}:${sequence}`
}

export async function saveChatMessages(
  userId: string,
  sessionId: string,
  messages: UIMessage[],
  options?: { title?: string },
) {
  const session = await getChatSessionForUser(userId, sessionId)
  if (!session) {
    throw new Error("Chat session not found")
  }

  await db.transaction(async (tx) => {
    for (let sequence = 0; sequence < messages.length; sequence += 1) {
      const message = messages[sequence]
      const messageId = stableMessageId(sessionId, message, sequence)

      await tx
        .insert(chatMessages)
        .values({
          id: messageId,
          sessionId,
          role: message.role,
          parts: message.parts,
          sequence,
        })
        .onConflictDoUpdate({
          target: [chatMessages.sessionId, chatMessages.sequence],
          set: {
            id: messageId,
            role: message.role,
            parts: message.parts,
          },
        })
    }

    if (messages.length > 0) {
      await tx
        .delete(chatMessages)
        .where(
          and(
            eq(chatMessages.sessionId, sessionId),
            gte(chatMessages.sequence, messages.length),
          ),
        )
    } else {
      await tx
        .delete(chatMessages)
        .where(eq(chatMessages.sessionId, sessionId))
    }

    await tx
      .update(chatSessions)
      .set({
        messageCount: messages.length,
        updatedAt: new Date(),
        ...(options?.title?.trim()
          ? { title: options.title.trim().slice(0, 120) }
          : {}),
      })
      .where(eq(chatSessions.id, sessionId))
  })
}

async function loadRecentMessagesForModel(
  sessionId: string,
  recentStartSequence: number,
) {
  const rows = await db
    .select({
      id: chatMessages.id,
      role: chatMessages.role,
      parts: chatMessages.parts,
      sequence: chatMessages.sequence,
    })
    .from(chatMessages)
    .where(
      and(
        eq(chatMessages.sessionId, sessionId),
        gte(chatMessages.sequence, recentStartSequence),
      ),
    )
    .orderBy(asc(chatMessages.sequence))

  return rows.map(rowToUIMessage)
}

export async function resolveModelMessages(
  userId: string,
  sessionId: string,
  clientMessages: UIMessage[],
): Promise<UIMessage[]> {
  const session = await getChatSessionForUser(userId, sessionId)
  if (!session || session.messageCount === 0) {
    return clientMessages.slice(-CHAT_MODEL_RECENT_LIMIT)
  }

  const recentStart = Math.max(
    0,
    session.messageCount - CHAT_MODEL_RECENT_LIMIT,
  )
  const unsavedCount = Math.max(0, clientMessages.length - session.messageCount)

  if (unsavedCount > 0 && clientMessages.length > session.messageCount) {
    const storedRecent = await loadRecentMessagesForModel(
      sessionId,
      recentStart,
    )
    const tail = clientMessages.slice(session.messageCount)
    return [...storedRecent, ...tail].slice(-CHAT_MODEL_RECENT_LIMIT)
  }

  const modelMessages = await loadRecentMessagesForModel(
    sessionId,
    recentStart,
  )
  return modelMessages.slice(-CHAT_MODEL_RECENT_LIMIT)
}
