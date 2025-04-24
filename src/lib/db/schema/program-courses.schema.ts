import { relations } from "drizzle-orm";
import {
	boolean,
	foreignKey,
	integer,
	pgTable,
	serial,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";

import { courses } from "./courses.schema";
import { programs } from "./programs.schema";

export const programCourses = pgTable(
	"program_courses",
	{
		id: serial().primaryKey().notNull(),
		year: integer(),
		period: integer(),
		programId: integer("program_id").notNull(),
		courseId: integer("course_id"),
		courseName: varchar("course_name", { length: 255 }),
		courseCode: varchar("course_code", { length: 255 }),
		createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
			.defaultNow()
			.notNull(),
		optional: boolean().default(false),
	},
	(table) => {
		return [
			foreignKey({
				columns: [table.courseId],
				foreignColumns: [courses.id],
				name: "program_courses_course_id_fkey",
			}),
			foreignKey({
				columns: [table.programId],
				foreignColumns: [programs.id],
				name: "program_courses_program_id_fkey",
			}),
		];
	},
);

export const programCoursesRelations = relations(programCourses, ({ one }) => ({
	course: one(courses, {
		fields: [programCourses.courseId],
		references: [courses.id],
	}),
	program: one(programs, {
		fields: [programCourses.programId],
		references: [programs.id],
	}),
}));

export type ProgramCourse = typeof programCourses.$inferSelect;
export type NewProgramCourse = typeof programCourses.$inferInsert;
