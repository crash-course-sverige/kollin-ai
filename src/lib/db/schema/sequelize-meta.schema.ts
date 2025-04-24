import { pgTable, varchar } from "drizzle-orm/pg-core";

export const sequelizeMeta = pgTable("SequelizeMeta", {
	name: varchar({ length: 255 }).notNull(),
});

export type SequelizeMeta = typeof sequelizeMeta.$inferSelect;
export type NewSequelizeMeta = typeof sequelizeMeta.$inferInsert;
