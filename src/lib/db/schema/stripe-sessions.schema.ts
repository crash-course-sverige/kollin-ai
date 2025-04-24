import { relations } from "drizzle-orm";
import {
	foreignKey,
	integer,
	pgTable,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";

import { courses } from "./courses.schema";
import { users } from "./users.schema";

export const stripeSessions = pgTable(
	"stripe_sessions",
	{
		sessionId: varchar("session_id", { length: 255 }).primaryKey().notNull(),
		userId: integer("user_id").notNull(),
		courseId: integer("course_id").notNull(),
		promoCode: varchar("promo_code", { length: 255 }),
		credits: integer(),
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
				columns: [table.courseId],
				foreignColumns: [courses.id],
				name: "stripe_sessions_course_id_fkey",
			}).onDelete("cascade"),
			foreignKey({
				columns: [table.userId],
				foreignColumns: [users.id],
				name: "stripe_sessions_user_id_fkey",
			}).onDelete("cascade"),
		];
	},
);

export const stripeSessionsRelations = relations(stripeSessions, ({ one }) => ({
	course: one(courses, {
		fields: [stripeSessions.courseId],
		references: [courses.id],
	}),
	user: one(users, {
		fields: [stripeSessions.userId],
		references: [users.id],
	}),
}));

export type StripeSession = typeof stripeSessions.$inferSelect;
export type NewStripeSession = typeof stripeSessions.$inferInsert;
