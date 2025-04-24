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

export const courseReviews = pgTable(
	"course_reviews",
	{
		id: serial().primaryKey().notNull(),
		score: integer(),
		title: varchar({ length: 255 }),
		text: varchar({ length: 255 }),
		courseId: integer("course_id").notNull(),
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
				columns: [table.courseId],
				foreignColumns: [courses.id],
				name: "course_reviews_course_id_fkey",
			}),
			foreignKey({
				columns: [table.userId],
				foreignColumns: [users.id],
				name: "course_reviews_user_id_fkey",
			}),
		];
	},
);

export const courseReviewsRelations = relations(courseReviews, ({ one }) => ({
	course: one(courses, {
		fields: [courseReviews.courseId],
		references: [courses.id],
	}),
	user: one(users, {
		fields: [courseReviews.userId],
		references: [users.id],
	}),
}));

export type CourseReview = typeof courseReviews.$inferSelect;
export type NewCourseReview = typeof courseReviews.$inferInsert;
