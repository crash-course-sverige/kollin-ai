import { relations } from "drizzle-orm";
import {
	foreignKey,
	integer,
	pgTable,
	serial,
	text,
	timestamp,
} from "drizzle-orm/pg-core";

import { flashcardEvaluations } from "./flashcard-evaluations.schema";
import { modules } from "./modules.schema";
import { users } from "./users.schema";

export const flashcards = pgTable(
	"flashcards",
	{
		id: serial().primaryKey().notNull(),
		questionText: text("question_text"),
		answerText: text("answer_text"),
		userId: integer("user_id").default(1),
		moduleId: integer("module_id"),
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
				columns: [table.moduleId],
				foreignColumns: [modules.id],
				name: "flashcards_module_id_fkey",
			}).onDelete("cascade"),
			foreignKey({
				columns: [table.userId],
				foreignColumns: [users.id],
				name: "flashcards_user_id_fkey",
			}).onDelete("set default"),
		];
	},
);

export const flashcardsRelations = relations(flashcards, ({ one, many }) => ({
	flashcardEvaluations: many(flashcardEvaluations),
	module: one(modules, {
		fields: [flashcards.moduleId],
		references: [modules.id],
	}),
	user: one(users, {
		fields: [flashcards.userId],
		references: [users.id],
	}),
}));

export type Flashcard = typeof flashcards.$inferSelect;
export type NewFlashcard = typeof flashcards.$inferInsert;
