import { relations } from "drizzle-orm"

import { user } from "../auth/user"
import { chatMessages } from "./messages"
import { chatSessions } from "./sessions"
import { chatSessionSummaries } from "./summaries"

export const chatSessionsRelations = relations(chatSessions, ({ one, many }) => ({
  user: one(user, {
    fields: [chatSessions.userId],
    references: [user.id],
  }),
  messages: many(chatMessages),
  summaries: many(chatSessionSummaries),
}))

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  session: one(chatSessions, {
    fields: [chatMessages.sessionId],
    references: [chatSessions.id],
  }),
}))

export const chatSessionSummariesRelations = relations(
  chatSessionSummaries,
  ({ one }) => ({
    session: one(chatSessions, {
      fields: [chatSessionSummaries.sessionId],
      references: [chatSessions.id],
    }),
  }),
)
