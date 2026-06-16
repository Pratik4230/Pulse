import { index, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core"

import { user } from "../auth/user"

export const chatSessions = pgTable(
  "chat_session",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    title: text("title").notNull().default("New chat"),
    messageCount: integer("message_count").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("chat_session_user_id_updated_at_idx").on(
      table.userId,
      table.updatedAt,
    ),
  ],
)
