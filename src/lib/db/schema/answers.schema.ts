import { relations } from "drizzle-orm";
import {
	boolean,
	foreignKey,
	integer,
	pgTable,
	serial,
	text,
	timestamp,
} from "drizzle-orm/pg-core";

import { questions } from "./questions.schema";
import { users } from "./users.schema";

export const answers = pgTable(
	"answers",
	{
		id: serial().primaryKey().notNull(),
		markdown: text(),
		html: text().notNull(),
		votes: integer().default(0),
		accepted: boolean().default(false),
		questionId: integer("question_id"),
		userId: integer("user_id").default(1),
		createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
			.defaultNow()
			.notNull(),
	},
	(table) => {
		return {
			answersQuestionIdFkey: foreignKey({
				columns: [table.questionId],
				foreignColumns: [questions.id],
				name: "answers_question_id_fkey",
			}).onDelete("cascade"),
			answersUserIdFkey: foreignKey({
				columns: [table.userId],
				foreignColumns: [users.id],
				name: "answers_user_id_fkey",
			}).onDelete("set default"),
		};
	},
);

export const answersRelations = relations(answers, ({ one }) => ({
	question: one(questions, {
		fields: [answers.questionId],
		references: [questions.id],
	}),
	user: one(users, {
		fields: [answers.userId],
		references: [users.id],
	}),
}));

export type Answer = typeof answers.$inferSelect;
export type NewAnswer = typeof answers.$inferInsert;
