import { relations } from "drizzle-orm";
import {
	foreignKey,
	integer,
	pgTable,
	serial,
	timestamp,
} from "drizzle-orm/pg-core";

import { tags } from "./tags.schema";
import { users } from "./users.schema";

export const theoryBookings = pgTable(
	"theory_bookings",
	{
		id: serial().primaryKey().notNull(),
		tagId: integer("tag_id"),
		userId: integer("user_id").default(1),
		createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
			.defaultNow()
			.notNull(),
	},
	(table) => {
		return [
			foreignKey({
				columns: [table.tagId],
				foreignColumns: [tags.id],
				name: "exercise_locations_tag_id_fkey",
			})
				.onUpdate("cascade")
				.onDelete("cascade"),
			foreignKey({
				columns: [table.userId],
				foreignColumns: [users.id],
				name: "theory_bookings_user_id_fkey",
			}).onDelete("set default"),
		];
	},
);

export const theoryBookingsRelations = relations(theoryBookings, ({ one }) => ({
	tag: one(tags, {
		fields: [theoryBookings.tagId],
		references: [tags.id],
	}),
	user: one(users, {
		fields: [theoryBookings.userId],
		references: [users.id],
	}),
}));

export type TheoryBooking = typeof theoryBookings.$inferSelect;
export type NewTheoryBooking = typeof theoryBookings.$inferInsert;
