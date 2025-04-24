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

import { exercises } from "./exercises.schema";
import { users } from "./users.schema";

export const exerciseNotes = pgTable(
	"exercise_notes",
	{
		id: serial().primaryKey().notNull(),
		public: boolean(),
		text: text(),
		type: varchar({ length: 255 }).default("note"),
		exerciseId: integer("exercise_id").notNull(),
		userId: integer("user_id").notNull(),
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
				columns: [table.exerciseId],
				foreignColumns: [exercises.id],
				name: "exercise_notes_exercise_id_fkey",
			}),
			foreignKey({
				columns: [table.userId],
				foreignColumns: [users.id],
				name: "exercise_notes_user_id_fkey",
			}),
		];
	},
);

export const exerciseNotesRelations = relations(exerciseNotes, ({ one }) => ({
	exercise: one(exercises, {
		fields: [exerciseNotes.exerciseId],
		references: [exercises.id],
	}),
	user: one(users, {
		fields: [exerciseNotes.userId],
		references: [users.id],
	}),
}));

export type ExerciseNote = typeof exerciseNotes.$inferSelect;
export type NewExerciseNote = typeof exerciseNotes.$inferInsert;
