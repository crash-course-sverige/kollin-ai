import { relations } from "drizzle-orm";
import {
	boolean,
	foreignKey,
	index,
	integer,
	pgTable,
	timestamp,
	unique,
	uuid,
} from "drizzle-orm/pg-core";

import { courses } from "./courses.schema";

export const coursePrerequisites = pgTable(
	"course_prerequisites",
	{
		id: uuid().primaryKey().notNull(),
		courseId: integer("course_id").notNull(),
		prerequisiteCourseId: integer("prerequisite_course_id").notNull(),
		required: boolean().default(false).notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
			.defaultNow()
			.notNull(),
		createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
			.defaultNow()
			.notNull(),
	},
	(table) => {
		return [
			index("course_prerequisites_course_id").using(
				"btree",
				table.courseId.asc().nullsLast(),
			),
			foreignKey({
				columns: [table.courseId],
				foreignColumns: [courses.id],
				name: "course_prerequisites_course_id_fkey",
			}).onDelete("cascade"),
			foreignKey({
				columns: [table.prerequisiteCourseId],
				foreignColumns: [courses.id],
				name: "course_prerequisites_prerequisite_course_id_fkey",
			}).onDelete("cascade"),
			unique("course_prerequisites_course_id_prerequisite_course_id_uk").on(
				table.courseId,
				table.prerequisiteCourseId,
			),
		];
	},
);

export const coursePrerequisitesRelations = relations(
	coursePrerequisites,
	({ one }) => ({
		course_courseId: one(courses, {
			fields: [coursePrerequisites.courseId],
			references: [courses.id],
			relationName: "coursePrerequisites_courseId_courses_id",
		}),
		course_prerequisiteCourseId: one(courses, {
			fields: [coursePrerequisites.prerequisiteCourseId],
			references: [courses.id],
			relationName: "coursePrerequisites_prerequisiteCourseId_courses_id",
		}),
	}),
);

export type CoursePrerequisite = typeof coursePrerequisites.$inferSelect;
export type NewCoursePrerequisite = typeof coursePrerequisites.$inferInsert;
