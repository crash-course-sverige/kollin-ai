import { relations } from "drizzle-orm";
import {
	boolean,
	foreignKey,
	index,
	integer,
	pgTable,
	serial,
	timestamp,
} from "drizzle-orm/pg-core";

import { courses } from "./courses.schema";
import { users } from "./users.schema";

export const userCourses = pgTable(
	"user_courses",
	{
		id: serial().primaryKey().notNull(),
		userId: integer("user_id"),
		courseId: integer("course_id"),
		createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
			.defaultNow()
			.notNull(),
		archived: boolean().default(false),
	},
	(table) => {
		return [
			index("user_courses_user_id").using(
				"btree",
				table.userId.asc().nullsLast(),
			),
			foreignKey({
				columns: [table.courseId],
				foreignColumns: [courses.id],
				name: "subscriptions_course_id_fkey",
			}).onDelete("cascade"),
			foreignKey({
				columns: [table.userId],
				foreignColumns: [users.id],
				name: "subscriptions_user_id_fkey",
			}).onDelete("cascade"),
		];
	},
);

export const userCoursesRelations = relations(userCourses, ({ one }) => ({
	course: one(courses, {
		fields: [userCourses.courseId],
		references: [courses.id],
	}),
	user: one(users, {
		fields: [userCourses.userId],
		references: [users.id],
	}),
}));

export type UserCourse = typeof userCourses.$inferSelect;
export type NewUserCourse = typeof userCourses.$inferInsert;
