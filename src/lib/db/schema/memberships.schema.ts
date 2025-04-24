import { relations } from "drizzle-orm";
import {
	foreignKey,
	integer,
	pgTable,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";

import { users } from "./users.schema";

export const memberships = pgTable(
	"memberships",
	{
		id: varchar({ length: 255 }).primaryKey().notNull(),
		status: varchar({ length: 255 }),
		expirationDate: timestamp("expiration_date", {
			withTimezone: true,
			mode: "string",
		}).notNull(),
		planId: varchar("plan_id", { length: 255 }),
		userId: integer("user_id").notNull(),
		createdAt: timestamp("created_at", {
			withTimezone: true,
			mode: "string",
		}).notNull(),
		updatedAt: timestamp("updated_at", {
			withTimezone: true,
			mode: "string",
		}).notNull(),
	},
	(table) => {
		return [
			foreignKey({
				columns: [table.userId],
				foreignColumns: [users.id],
				name: "memberships_user_id_fkey",
			}),
		];
	},
);

export const membershipsRelations = relations(memberships, ({ one }) => ({
	user: one(users, {
		fields: [memberships.userId],
		references: [users.id],
	}),
}));

export type Membership = typeof memberships.$inferSelect;
export type NewMembership = typeof memberships.$inferInsert;
