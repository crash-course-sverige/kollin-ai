import { relations } from "drizzle-orm";
import {
	foreignKey,
	integer,
	pgTable,
	serial,
	text,
	timestamp,
} from "drizzle-orm/pg-core";

import { answers } from "./answers.schema";
import { exercises } from "./exercises.schema";
import { users } from "./users.schema";

export const questions = pgTable(
	"questions",
	{
		id: serial().primaryKey().notNull(),
		markdown: text(),
		html: text().notNull(),
		votes: integer().default(0),
		userId: integer("user_id").default(1),
		exerciseId: integer("exercise_id"),
		createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
			.defaultNow()
			.notNull(),
	},
	(table) => {
		return [
			foreignKey({
				columns: [table.exerciseId],
				foreignColumns: [exercises.id],
				name: "questions_exercise_id_fkey",
			}).onDelete("cascade"),
			foreignKey({
				columns: [table.userId],
				foreignColumns: [users.id],
				name: "questions_user_id_fkey",
			}).onDelete("set default"),
		];
	},
);

export const questionsRelations = relations(questions, ({ one, many }) => ({
	answers: many(answers),
	exercise: one(exercises, {
		fields: [questions.exerciseId],
		references: [exercises.id],
	}),
	user: one(users, {
		fields: [questions.userId],
		references: [users.id],
	}),
}));

export type Question = typeof questions.$inferSelect;
export type NewQuestion = typeof questions.$inferInsert;
