import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

/**
 * This is a placeholder auth schema for compatibility,
 * typically this would be fully implemented with NextAuth
 */
export const users = pgTable("users", {
  id: text("id").primaryKey().notNull(),
  name: text("name"),
  email: text("email").unique().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Export types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert; 