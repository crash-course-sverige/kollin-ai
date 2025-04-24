import { relations } from "drizzle-orm";
import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { courses } from "./courses.schema";
import { programPlans } from "./program-plans.schema";

export const programPlanCourses = pgTable(
	"program_plan_courses",
	{
		id: uuid("id").primaryKey().notNull(),
		typename: text("typename").notNull(),
		courseCode: text("course_code").notNull(),
		courseId: integer("course_id"),
		courseName: text("course_name").notNull(),
		createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
			.defaultNow()
			.notNull(),
		endPeriod: integer("end_period").notNull(),
		programPlanId: uuid("program_plan_id").notNull(),
		startPeriod: integer("start_period").notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
			.defaultNow()
			.notNull(),
		year: integer("year").notNull(),
	},
	(table) => {
		return [
			{
				foreignKey: {
					columns: [table.courseId],
					foreignColumns: [courses.id],
					name: "program_plan_courses_course_id_fkey",
				},
			},
			{
				foreignKey: {
					columns: [table.programPlanId],
					foreignColumns: [programPlans.id],
					name: "program_plan_courses_program_plan_id_fkey",
				},
			},
		];
	},
);

export const programPlanCoursesRelations = relations(
	programPlanCourses,
	({ one }) => ({
		course: one(courses, {
			fields: [programPlanCourses.courseId],
			references: [courses.id],
		}),
		programPlan: one(programPlans, {
			fields: [programPlanCourses.programPlanId],
			references: [programPlans.id],
		}),
	}),
);

export type ProgramPlanCourse = typeof programPlanCourses.$inferSelect;
export type NewProgramPlanCourse = typeof programPlanCourses.$inferInsert;
