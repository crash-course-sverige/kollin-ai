import { relations } from "drizzle-orm";
import {
	foreignKey,
	integer,
	jsonb,
	pgTable,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";

import { courses } from "./courses.schema";

export const courseMetadata = pgTable(
	"CourseMetadata",
	{
		id: uuid().primaryKey().notNull(),
		schoolData: jsonb("school_data").notNull(),
		courseId: integer("course_id").notNull(),
		createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
			.defaultNow()
			.notNull(),
	},
	(table) => {
		return [
			foreignKey({
				columns: [table.courseId],
				foreignColumns: [courses.id],
				name: "CourseMetadata_course_id_fkey",
			}).onDelete("cascade"),
		];
	},
);

export const courseMetadataRelations = relations(courseMetadata, ({ one }) => ({
	course: one(courses, {
		fields: [courseMetadata.courseId],
		references: [courses.id],
	}),
}));

export type CourseMetadata = typeof courseMetadata.$inferSelect;
export type NewCourseMetadata = typeof courseMetadata.$inferInsert;
