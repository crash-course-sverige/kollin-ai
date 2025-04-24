import {
	boolean,
	integer,
	pgTable,
	serial,
	text,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";

export const creditsBundles = pgTable("credits_bundles", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	imageUrl: varchar({ length: 255 }),
	amount: integer().notNull(),
	active: boolean().default(true).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
		.defaultNow()
		.notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
		.defaultNow()
		.notNull(),
});

export type CreditBundle = typeof creditsBundles.$inferSelect;
export type NewCreditBundle = typeof creditsBundles.$inferInsert;
