import { relations } from "drizzle-orm";
import {
	bigint,
	foreignKey,
	index,
	integer,
	pgTable,
	serial,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";

import { clusterings } from "./clusterings.schema";
import { courses } from "./courses.schema";
import { exerciseLocations } from "./exercise-locations.schema";
import { flashcards } from "./flashcards.schema";
import { tagLocations } from "./tag-locations.schema";

export const modules = pgTable(
	"modules",
	{
		id: serial().primaryKey().notNull(),
		name: varchar({ length: 255 }),
		order: integer(),
		// You can use { mode: "bigint" } if numbers are exceeding js number limitations
		courseId: bigint("course_id", { mode: "number" }),
		createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
			.defaultNow()
			.notNull(),
	},
	(table) => {
		return [
			index("idx_modules_course_id").using(
				"btree",
				table.courseId.asc().nullsLast(),
			),
			foreignKey({
				columns: [table.courseId],
				foreignColumns: [courses.id],
				name: "clusters_course_id_fkey",
			})
				.onUpdate("cascade")
				.onDelete("cascade"),
		];
	},
);

export const modulesRelations = relations(modules, ({ one, many }) => ({
	course: one(courses, {
		fields: [modules.courseId],
		references: [courses.id],
	}),
	flashcards: many(flashcards),
	tagLocations: many(tagLocations),
	exerciseLocations: many(exerciseLocations),
	clusterings: many(clusterings),
}));

export type Module = typeof modules.$inferSelect;
export type NewModule = typeof modules.$inferInsert;
