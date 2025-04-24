import { relations } from "drizzle-orm";
import { pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";

import { categories } from "./categories.schema";
import { courses } from "./courses.schema";

export const subjects = pgTable("subjects", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 255 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
		.defaultNow()
		.notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
		.defaultNow()
		.notNull(),
});

export const subjectsRelations = relations(subjects, ({ many }) => ({
	courses: many(courses),
	categories: many(categories),
}));

export type Subject = typeof subjects.$inferSelect;
export type NewSubject = typeof subjects.$inferInsert;
