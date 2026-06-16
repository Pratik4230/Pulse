import { integer, pgTable, text, timestamp, unique } from "drizzle-orm/pg-core"

import { chatSessions } from "./sessions"

export const chatSessionSummaries = pgTable(
  "chat_session_summary",
  {
    id: text("id").primaryKey(),
    sessionId: text("session_id")
      .notNull()
      .references(() => chatSessions.id, { onDelete: "cascade" }),
    fromSequence: integer("from_sequence").notNull(),
    toSequence: integer("to_sequence").notNull(),
    summary: text("summary").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    unique("chat_session_summary_session_to_sequence_unique").on(
      table.sessionId,
      table.toSequence,
    ),
  ],
)
