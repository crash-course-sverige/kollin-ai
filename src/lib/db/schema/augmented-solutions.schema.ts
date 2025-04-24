import { relations } from "drizzle-orm";
import {
	integer,
	jsonb,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";

import { AugmentedSolutionMetadata } from "@/utils/llm/llm-metadata";

import { exercises } from "./exercises.schema";

type AugmentedSolutionStep = {
	number: number;
	heading: string;
	explanation: string;
};

export const augmentedSolutions = pgTable("augmented_solutions", {
	id: uuid("id").primaryKey().notNull().defaultRandom(),
	steps: jsonb("steps").$type<AugmentedSolutionStep[]>(),
	answer: text("answer"),
	altApproaces: jsonb("alt_approaches").$type<string[]>(),
	pitfalls: jsonb("pitfalls").$type<string[]>(),
	exerciseId: integer("exercise_id").references(() => exercises.id),
	metadata: jsonb("metadata").$type<AugmentedSolutionMetadata>(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
		.defaultNow()
		.notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
		.defaultNow()
		.notNull(),
});

export const augmentedSolutionsRelations = relations(
	augmentedSolutions,
	({ one }) => ({
		exercise: one(exercises, {
			fields: [augmentedSolutions.exerciseId],
			references: [exercises.id],
		}),
	}),
);

export type AugmentedSolution = typeof augmentedSolutions.$inferSelect;
export type NewAugmentedSolution = typeof augmentedSolutions.$inferInsert;
