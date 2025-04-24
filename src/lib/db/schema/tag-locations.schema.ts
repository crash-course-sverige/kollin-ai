import { relations } from "drizzle-orm";
import {
	foreignKey,
	index,
	integer,
	pgTable,
	smallint,
} from "drizzle-orm/pg-core";

import { courses } from "./courses.schema";
import { modules } from "./modules.schema";
import { tags } from "./tags.schema";

export const tagLocations = pgTable(
	"tag_locations",
	{
		tagId: integer("tag_id"),
		moduleId: integer("module_id"),
		courseId: integer("course_id"),
		ordering: smallint(),
		rank: smallint().default(2),
	},
	(table) => {
		return [
			index("module_id").using("btree", table.moduleId.asc().nullsLast()),
			index("tag_id").using("btree", table.tagId.asc().nullsLast()),
			foreignKey({
				columns: [table.courseId],
				foreignColumns: [courses.id],
				name: "tag_locations_course_id_fkey",
			}).onDelete("cascade"),
			foreignKey({
				columns: [table.moduleId],
				foreignColumns: [modules.id],
				name: "tag_locations_module_id_fkey",
			}).onDelete("cascade"),
			foreignKey({
				columns: [table.tagId],
				foreignColumns: [tags.id],
				name: "tag_locations_tag_id_fkey",
			}).onDelete("cascade"),
		];
	},
);

export const tagLocationsRelations = relations(tagLocations, ({ one }) => ({
	course: one(courses, {
		fields: [tagLocations.courseId],
		references: [courses.id],
	}),
	module: one(modules, {
		fields: [tagLocations.moduleId],
		references: [modules.id],
	}),
	tag: one(tags, {
		fields: [tagLocations.tagId],
		references: [tags.id],
	}),
}));

export type TagLocation = typeof tagLocations.$inferSelect;
export type NewTagLocation = typeof tagLocations.$inferInsert;
