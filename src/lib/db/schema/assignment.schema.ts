import {
	integer,
	jsonb,
	numeric,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";

export const assignments = pgTable("assignments", {
	id: uuid("id").primaryKey(),
	typename: text("typename").notNull(),
	answerFillInBlanks: text("answer_fill_in_blanks"),
	answerNumberInput: text("answer_number_input"),
	answerOptions: jsonb("answer_options").default("[]"),
	createdAt: timestamp("created_at", {
		withTimezone: true,
		mode: "string",
	}).notNull(),
	difficultyScore: numeric("difficulty_score", { precision: 3, scale: 1 }),
	exerciseId: text("exercise_id"),
	hints: jsonb("hints").default("[]"),
	questionText: text("question_text"),
	solutionText: text("solution_text"),
	tagIds: jsonb("tag_ids").default("[]"),
	updatedAt: timestamp("updated_at", {
		withTimezone: true,
		mode: "string",
	}).notNull(),
	userId: integer("user_id"),
});
