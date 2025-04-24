import {
	integer,
	jsonb,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";

export const programPlans = pgTable("program_plans", {
	id: uuid("id").primaryKey(),
	typename: text("typename").notNull(),
	createdAt: timestamp("created_at", {
		withTimezone: true,
		mode: "string",
	}).notNull(),
	groups: jsonb("groups").notNull().default("[]"),
	name: text("name").notNull(),
	programId: integer("program_id").notNull(),
	updatedAt: timestamp("updated_at", {
		withTimezone: true,
		mode: "string",
	}).notNull(),
	userId: integer("user_id").notNull(),
});

export type ProgramPlan = typeof programPlans.$inferSelect;
export type NewProgramPlan = typeof programPlans.$inferInsert;

export const programPlanCourses = pgTable("program_plan_courses", {
	id: uuid("id").primaryKey(),
	typename: text("typename").notNull(),
	courseCode: text("course_code").notNull(),
	courseId: integer("course_id"), // nullable
	courseName: text("course_name").notNull(),
	createdAt: timestamp("created_at", {
		withTimezone: true,
		mode: "string",
	})
		.notNull()
		.defaultNow(),
	endPeriod: integer("end_period").notNull(),
	programPlanId: uuid("program_plan_id").notNull(),
	startPeriod: integer("start_period").notNull(),
	updatedAt: timestamp("updated_at", {
		withTimezone: true,
		mode: "string",
	})
		.notNull()
		.defaultNow(),
	year: integer("year").notNull(),
});

export type ProgramPlanCourse = typeof programPlanCourses.$inferSelect;
export type NewProgramPlanCourse = typeof programPlanCourses.$inferInsert;
