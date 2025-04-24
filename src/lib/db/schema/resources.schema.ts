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
import { users } from "./users.schema";

export const resources = pgTable(
	"resources",
	{
		id: serial().primaryKey().notNull(),
		hash: varchar({ length: 255 }),
		format: varchar({ length: 255 }),
		type: varchar({ length: 255 }),
		name: varchar({ length: 255 }),
		url: varchar({ length: 255 }),
		courseCode: varchar("course_code", { length: 255 }),
		author: varchar({ length: 255 }),
		date: varchar({ length: 255 }),
		markingCompleted: boolean("marking_completed"),
		courseId: integer("course_id"),
		uploadedBy: integer("uploaded_by").default(1),
		createdAt: timestamp("created_at", {
			withTimezone: true,
			mode: "string",
		}).notNull(),
		updatedAt: timestamp("updated_at", {
			withTimezone: true,
			mode: "string",
		}).notNull(),
		hidden: boolean().default(false),
		public: boolean().default(true),
	},
	(table) => {
		return [
			foreignKey({
				columns: [table.courseId],
				foreignColumns: [courses.id],
				name: "resources_course_id_fkey",
			}).onDelete("cascade"),
			foreignKey({
				columns: [table.uploadedBy],
				foreignColumns: [users.id],
				name: "resources_uploaded_by_fkey",
			}).onDelete("set default"),
		];
	},
);

export const resourcesRelations = relations(resources, ({ one }) => ({
	course: one(courses, {
		fields: [resources.courseId],
		references: [courses.id],
	}),
	user: one(users, {
		fields: [resources.uploadedBy],
		references: [users.id],
	}),
}));

export type Resource = typeof resources.$inferSelect;
export type NewResource = typeof resources.$inferInsert;
