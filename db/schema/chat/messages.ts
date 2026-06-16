import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core"

import { chatSessions } from "./sessions"

export const chatMessages = pgTable(
  "chat_message",
  {
    id: text("id").primaryKey(),
    sessionId: text("session_id")
      .notNull()
      .references(() => chatSessions.id, { onDelete: "cascade" }),
    role: text("role").notNull(),
    parts: jsonb("parts").notNull(),
    sequence: integer("sequence").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("chat_message_session_id_sequence_idx").on(
      table.sessionId,
      table.sequence,
    ),
    unique("chat_message_session_id_sequence_unique").on(
      table.sessionId,
      table.sequence,
    ),
  ],
)
