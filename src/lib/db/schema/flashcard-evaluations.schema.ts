import { relations } from "drizzle-orm";
import {
	foreignKey,
	integer,
	pgTable,
	serial,
	timestamp,
} from "drizzle-orm/pg-core";

import { flashcards } from "./flashcards.schema";
import { users } from "./users.schema";

export const flashcardEvaluations = pgTable(
	"flashcard_evaluations",
	{
		id: serial().primaryKey().notNull(),
		score: integer(),
		userId: integer("user_id"),
		flashcardId: integer("flashcard_id"),
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
				columns: [table.flashcardId],
				foreignColumns: [flashcards.id],
				name: "flashcard_evaluations_flashcard_id_fkey",
			}).onDelete("cascade"),
			foreignKey({
				columns: [table.userId],
				foreignColumns: [users.id],
				name: "flashcard_evaluations_user_id_fkey",
			}).onDelete("cascade"),
		];
	},
);

export const flashcardEvaluationsRelations = relations(
	flashcardEvaluations,
	({ one }) => ({
		flashcard: one(flashcards, {
			fields: [flashcardEvaluations.flashcardId],
			references: [flashcards.id],
		}),
		user: one(users, {
			fields: [flashcardEvaluations.userId],
			references: [users.id],
		}),
	}),
);

export type FlashcardEvaluation = typeof flashcardEvaluations.$inferSelect;
export type NewFlashcardEvaluation = typeof flashcardEvaluations.$inferInsert;
