import { relations } from "drizzle-orm";
import {
	boolean,
	foreignKey,
	integer,
	pgTable,
	serial,
	text,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";

import { courses } from "./courses.schema";
import { users } from "./users.schema";

export const studyPlans = pgTable(
	"study_plans",
	{
		id: serial().primaryKey().notNull(),
		contentfulId: varchar("contentful_id", { length: 255 }),
		published: boolean(),
		price: integer(),
		name: varchar({ length: 255 }),
		description: text(),
		imageUrl: varchar("image_url", { length: 255 }),
		userId: integer("user_id"),
		courseId: integer("course_id"),
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
				name: "study_plans_course_id_fkey",
			}),
			foreignKey({
				columns: [table.userId],
				foreignColumns: [users.id],
				name: "study_plans_user_id_fkey",
			}),
		];
	},
);

export const studyPlansRelations = relations(studyPlans, ({ one }) => ({
	course: one(courses, {
		fields: [studyPlans.courseId],
		references: [courses.id],
	}),
	user: one(users, {
		fields: [studyPlans.userId],
		references: [users.id],
	}),
}));

export type StudyPlan = typeof studyPlans.$inferSelect;
export type NewStudyPlan = typeof studyPlans.$inferInsert;
