import { relations } from "drizzle-orm";
import {
	boolean,
	foreignKey,
	index,
	integer,
	pgTable,
	serial,
	text,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";

import { courses } from "./courses.schema";
import { documents } from "./documents.schema";
import { exercises } from "./exercises.schema";
import { users } from "./users.schema";

export const sources = pgTable(
	"sources",
	{
		id: serial().primaryKey().notNull(),
		date: varchar({ length: 255 }),
		author: varchar({ length: 255 }),
		exercisesMarkingCompleted: boolean("exercises_marking_completed")
			.default(false)
			.notNull(),
		format: varchar({ length: 255 }),
		exercisesSrc: text("exercises_src"),
		solutionsSrc: text("solutions_src"),
		courseId: integer("course_id"),
		uploader: integer(),
		createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
			.defaultNow()
			.notNull(),
		examExercisesSrc: varchar("exam_exercises_src", { length: 255 }),
		examSolutionsSrc: varchar("exam_solutions_src", { length: 255 }),
		solutionsMarkingCompleted: boolean("solutions_marking_completed")
			.default(false)
			.notNull(),
	},
	(table) => {
		return [
			index("idx_sources_course_id").using(
				"btree",
				table.courseId.asc().nullsLast(),
			),
			foreignKey({
				columns: [table.courseId],
				foreignColumns: [courses.id],
				name: "sources_course_id_fkey",
			}).onDelete("cascade"),
			foreignKey({
				columns: [table.uploader],
				foreignColumns: [users.id],
				name: "sources_uploader_fkey",
			}),
		];
	},
);

export const sourcesRelations = relations(sources, ({ one, many }) => ({
	course: one(courses, {
		fields: [sources.courseId],
		references: [courses.id],
	}),
	user: one(users, {
		fields: [sources.uploader],
		references: [users.id],
	}),
	exercises: many(exercises),
	documents: many(documents),
}));

export type Source = typeof sources.$inferSelect;
export type NewSource = typeof sources.$inferInsert;
