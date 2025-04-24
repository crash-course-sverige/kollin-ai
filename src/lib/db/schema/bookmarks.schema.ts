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
import { exercises } from "./exercises.schema";
import { users } from "./users.schema";

export const bookmarks = pgTable(
	"bookmarks",
	{
		id: serial().primaryKey().notNull(),
		userId: integer("user_id"),
		exerciseId: integer("exercise_id"),
		courseId: integer("course_id"),
		createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
			.defaultNow()
			.notNull(),
		note: varchar({ length: 255 }),
	},
	(table) => {
		return [
			foreignKey({
				columns: [table.courseId],
				foreignColumns: [courses.id],
				name: "bookmarks_course_id_fkey",
			}).onDelete("cascade"),
			foreignKey({
				columns: [table.exerciseId],
				foreignColumns: [exercises.id],
				name: "bookmarks_exercise_id_fkey",
			}).onDelete("cascade"),
			foreignKey({
				columns: [table.userId],
				foreignColumns: [users.id],
				name: "bookmarks_user_id_fkey",
			}).onDelete("cascade"),
		];
	},
);

export const bookmarksRelations = relations(bookmarks, ({ one }) => ({
	course: one(courses, {
		fields: [bookmarks.courseId],
		references: [courses.id],
	}),
	exercise: one(exercises, {
		fields: [bookmarks.exerciseId],
		references: [exercises.id],
	}),
	user: one(users, {
		fields: [bookmarks.userId],
		references: [users.id],
	}),
}));

export type Bookmark = typeof bookmarks.$inferSelect;
export type NewBookmark = typeof bookmarks.$inferInsert;
