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

export const swishPayments = pgTable(
	"swish_payments",
	{
		id: varchar({ length: 255 }).primaryKey().notNull(),
		credits: integer().default(0),
		userId: integer("user_id").notNull(),
		courseId: integer("course_id").notNull(),
		promoCode: varchar("promo_code", { length: 255 }),
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
				name: "swish_payments_course_id_fkey",
			}).onDelete("cascade"),
			foreignKey({
				columns: [table.userId],
				foreignColumns: [users.id],
				name: "swish_payments_user_id_fkey",
			}).onDelete("cascade"),
		];
	},
);

export const swishPaymentsRelations = relations(swishPayments, ({ one }) => ({
	course: one(courses, {
		fields: [swishPayments.courseId],
		references: [courses.id],
	}),
	user: one(users, {
		fields: [swishPayments.userId],
		references: [users.id],
	}),
}));

export type SwishPayment = typeof swishPayments.$inferSelect;
export type NewSwishPayment = typeof swishPayments.$inferInsert;
