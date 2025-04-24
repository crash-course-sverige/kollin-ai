import { relations } from "drizzle-orm";
import {
	foreignKey,
	index,
	integer,
	pgTable,
	serial,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";

import { exercises } from "./exercises.schema";
import { users } from "./users.schema";

export const exerciseEvaluations = pgTable(
	"exercise_evaluations",
	{
		id: serial().primaryKey().notNull(),
		userId: integer("user_id").default(1),
		exerciseId: integer("exercise_id"),
		score: integer(),
		createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
			.defaultNow()
			.notNull(),
		origin: varchar({ length: 255 }).default("tntor"),
	},
	(table) => {
		return [
			index("exercise_evaluations_exerercise_id").using(
				"btree",
				table.exerciseId.asc().nullsLast(),
			),
			index("idx_exercise_evaluations_exercise_id").using(
				"btree",
				table.exerciseId.asc().nullsLast(),
			),
			index("idx_exercise_evaluations_origin").using(
				"btree",
				table.origin.asc().nullsLast(),
			),
			index("idx_exercise_evaluations_user_and_exercise_id").using(
				"btree",
				table.userId.asc().nullsLast(),
				table.exerciseId.asc().nullsLast(),
			),
			index("idx_exercise_evaluations_user_id").using(
				"btree",
				table.userId.asc().nullsLast(),
			),
			foreignKey({
				columns: [table.exerciseId],
				foreignColumns: [exercises.id],
				name: "exercise_evaluations_exercise_id_fkey",
			}).onDelete("cascade"),
			foreignKey({
				columns: [table.userId],
				foreignColumns: [users.id],
				name: "exercise_evaluations_user_id_fkey",
			}).onDelete("set default"),
		];
	},
);

export const exerciseEvaluationsRelations = relations(
	exerciseEvaluations,
	({ one }) => ({
		exercise: one(exercises, {
			fields: [exerciseEvaluations.exerciseId],
			references: [exercises.id],
		}),
		user: one(users, {
			fields: [exerciseEvaluations.userId],
			references: [users.id],
		}),
	}),
);

export type ExerciseEvaluation = typeof exerciseEvaluations.$inferSelect;
export type NewExerciseEvaluation = typeof exerciseEvaluations.$inferInsert;
