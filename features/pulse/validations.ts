import * as z from "zod"

export const CHAT_MAX_MESSAGE_CHARS = 5000

const uiMessageSchema = z.looseObject({
  id: z.string().max(200).optional(),
  role: z.string().max(32),
  parts: z.array(z.unknown()).max(200),
})

export const chatSessionIdSchema = z.string().trim().min(1).max(200)

export const chatPostBodySchema = z.object({
  sessionId: chatSessionIdSchema,
  messages: z.array(uiMessageSchema).min(1).max(400),
})

export const chatRouteParamsSchema = z.object({
  id: chatSessionIdSchema,
})

export const chatMessagesQuerySchema = z.object({
  before: z.coerce.number().int().nonnegative().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
})
