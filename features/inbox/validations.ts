import * as z from "zod"

export const inboxMessagesQuerySchema = z.object({
  filter: z.enum(["all", "unread"]).optional(),
  pageToken: z.string().max(500).optional(),
})
