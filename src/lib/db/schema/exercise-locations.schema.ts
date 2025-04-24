import { relations } from "drizzle-orm";
import {
	doublePrecision,
	foreignKey,
	index,
	integer,
	pgTable,
} from "drizzle-orm/pg-core";

import { exercises } from "./exercises.schema";
import { modules } from "./modules.schema";
import { tags } from "./tags.schema";

export const exerciseLocations = pgTable(
	"exercise_locations",
	{
		tagId: integer("tag_id"),
		exerciseId: integer("exercise_id"),
		moduleId: integer("module_id"),
		relevance: doublePrecision(),
	},
	(table) => {
		return [
			index("exercise_id_idx").using(
				"btree",
				table.exerciseId.asc().nullsLast(),
			),
			index("module_id_idx").using("btree", table.moduleId.asc().nullsLast()),
			index("tag_id_idx").using("btree", table.tagId.asc().nullsLast()),
			foreignKey({
				columns: [table.exerciseId],
				foreignColumns: [exercises.id],
				name: "exercise_locations_exercise_id_fkey",
			}).onDelete("cascade"),
			foreignKey({
				columns: [table.moduleId],
				foreignColumns: [modules.id],
				name: "exercise_locations_module_id_fkey",
			}),
			foreignKey({
				columns: [table.tagId],
				foreignColumns: [tags.id],
				name: "exercise_locations_tag_id_fkey",
			})
				.onUpdate("cascade")
				.onDelete("cascade"),
		];
	},
);

export const exerciseLocationsRelations = relations(
	exerciseLocations,
	({ one }) => ({
		exercise: one(exercises, {
			fields: [exerciseLocations.exerciseId],
			references: [exercises.id],
		}),
		module: one(modules, {
			fields: [exerciseLocations.moduleId],
			references: [modules.id],
		}),
		tag: one(tags, {
			fields: [exerciseLocations.tagId],
			references: [tags.id],
		}),
	}),
);

export type ExerciseLocation = typeof exerciseLocations.$inferSelect;
export type NewExerciseLocation = typeof exerciseLocations.$inferInsert;
