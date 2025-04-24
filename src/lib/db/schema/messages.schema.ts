import { relations } from "drizzle-orm";
import {
	foreignKey,
	integer,
	pgTable,
	serial,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";

import { courses } from "./courses.schema";
import { users } from "./users.schema";

export const messages = pgTable(
	"messages",
	{
		id: serial().primaryKey().notNull(),
		text: varchar({ length: 255 }),
		courseId: integer("course_id"),
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
				columns: [table.courseId],
				foreignColumns: [courses.id],
				name: "messages_course_id_fkey",
			}).onDelete("cascade"),
			foreignKey({
				columns: [table.userId],
				foreignColumns: [users.id],
				name: "messages_user_id_fkey",
			}).onDelete("cascade"),
		];
	},
);

export const messagesRelations = relations(messages, ({ one }) => ({
	course: one(courses, {
		fields: [messages.courseId],
		references: [courses.id],
	}),
	user: one(users, {
		fields: [messages.userId],
		references: [users.id],
	}),
}));

export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
