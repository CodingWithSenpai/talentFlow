import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core"

export const waitlist = pgTable(
  "waitlist",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull().unique(),
    ip: text("ip"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("waitlist_email_idx").on(table.email)],
)
