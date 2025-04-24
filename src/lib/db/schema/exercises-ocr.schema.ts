import { relations } from "drizzle-orm";
import {
	foreignKey,
	index,
	integer,
	pgTable,
	text,
	timestamp,
	vector,
} from "drizzle-orm/pg-core";

import { exercises } from "./exercises.schema";

export const exercisesOcr = pgTable(
	"exercises_ocr",
	{
		exerciseId: integer("exercise_id").primaryKey().notNull(),
		ocrResult: text("ocr_result"),
		updatedAt: timestamp("updated_at", { mode: "string" }),
		embedding: vector("embedding", { dimensions: 1536 }),
	},
	(table) => {
		return [
			index("exercises_ocr_embedding_idx").using(
				"hnsw",
				table.embedding.asc().nullsLast().op("vector_cosine_ops"),
			),
			index("exercises_ocr_exercise_id").using(
				"btree",
				table.exerciseId.asc().nullsLast(),
			),
			foreignKey({
				columns: [table.exerciseId],
				foreignColumns: [exercises.id],
				name: "exercises_ocr_exercises_fkey",
			})
				.onUpdate("cascade")
				.onDelete("cascade"),
		];
	},
);

export const exercisesOcrRelations = relations(exercisesOcr, ({ one }) => ({
	exercise: one(exercises, {
		fields: [exercisesOcr.exerciseId],
		references: [exercises.id],
	}),
}));

export type ExerciseOcr = typeof exercisesOcr.$inferSelect;
export type NewExerciseOcr = typeof exercisesOcr.$inferInsert;
