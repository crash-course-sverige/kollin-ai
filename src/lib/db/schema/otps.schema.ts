import { relations, sql } from "drizzle-orm";
import {
	foreignKey,
	integer,
	pgTable,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";

import { users } from "./users.schema";

export const otps = pgTable(
	"otps",
	{
		id: uuid().primaryKey().notNull(),
		action: varchar({ length: 255 }).notNull(),
		receiver: varchar({ length: 255 }).notNull(),
		code: varchar({ length: 255 }).notNull(),
		attempts: integer().default(0).notNull(),
		expiresAt: timestamp("expires_at", { withTimezone: true, mode: "string" })
			.default(sql`(now() + '00:05:00'::interval)`)
			.notNull(),
		userId: integer("user_id"),
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
				name: "otps_user_id_fkey",
			}).onDelete("cascade"),
		];
	},
);

export const otpsRelations = relations(otps, ({ one }) => ({
	user: one(users, {
		fields: [otps.userId],
		references: [users.id],
	}),
}));
