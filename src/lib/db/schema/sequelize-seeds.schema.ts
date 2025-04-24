import { pgTable, varchar } from "drizzle-orm/pg-core";

export const sequelizeSeeds = pgTable("SequelizeSeeds", {
	name: varchar({ length: 255 }).notNull(),
});

export type SequelizeSeed = typeof sequelizeSeeds.$inferSelect;
export type NewSequelizeSeed = typeof sequelizeSeeds.$inferInsert;
