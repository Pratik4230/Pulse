import {
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core"

import { user } from "../auth/user"

export const aiDailyUsage = pgTable(
  "ai_daily_usage",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    usageDate: text("usage_date").notNull(),
    messageCount: integer("message_count").notNull().default(0),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.usageDate] }),
  ],
)
