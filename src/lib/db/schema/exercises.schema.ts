import { relations } from "drizzle-orm";
import {
	boolean,
	doublePrecision,
	foreignKey,
	index,
	integer,
	pgTable,
	real,
	serial,
	text,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";

import { augmentedSolutions } from "./augmented-solutions.schema";
import { autoTagVotes } from "./auto-tag-votes.schema";
import { bookmarks } from "./bookmarks.schema";
import { categorisations } from "./categorisations.schema";
import { chatPromptSuggestions } from "./chats.schema";
import { exerciseEvaluations } from "./exercise-evaluations.schema";
import { exerciseLocations } from "./exercise-locations.schema";
import { exerciseNotes } from "./exercise-notes.schema";
import { exercisesOcr } from "./exercises-ocr.schema";
import { questions } from "./questions.schema";
import { solutions } from "./solutions.schema";
import { sources } from "./sources.schema";
import { tagVotes } from "./tag-votes.schema";
import { threads } from "./threads.schema";
import { users } from "./users.schema";

export const exercises = pgTable(
	"exercises",
	{
		id: serial().primaryKey().notNull(),
		format: varchar({ length: 255 }).notNull(),
		sourceId: integer("source_id"),
		number: varchar({ length: 255 }),
		points: real(),
		y: integer(),
		h: integer(),
		w: integer(),
		html: text(),
		createdBy: integer("created_by").default(1),
		createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
			.defaultNow()
			.notNull(),
		recommended: boolean().default(false),
		imageUrl: varchar("image_url"),
		maxTagCertainty: doublePrecision("max_tag_certainty"),
		published: boolean().default(false).notNull(),
	},
	(table) => {
		return [
			index("idx_exercises_source_id").using(
				"btree",
				table.sourceId.asc().nullsLast(),
			),
			foreignKey({
				columns: [table.createdBy],
				foreignColumns: [users.id],
				name: "exercises_created_by_fkey",
			}).onDelete("set null"),
			foreignKey({
				columns: [table.sourceId],
				foreignColumns: [sources.id],
				name: "exercises_source_id_fkey",
			}).onDelete("cascade"),
		];
	},
);

export const exercisesRelations = relations(exercises, ({ one, many }) => ({
	exercisesOcrs: many(exercisesOcr),
	exerciseEvaluations: many(exerciseEvaluations),
	solutions: many(solutions),
	threads: many(threads),
	user: one(users, {
		fields: [exercises.createdBy],
		references: [users.id],
	}),
	source: one(sources, {
		fields: [exercises.sourceId],
		references: [sources.id],
	}),
	questions: many(questions),
	autoTagVotes: many(autoTagVotes),
	exerciseLocations: many(exerciseLocations),
	exerciseNotes: many(exerciseNotes),
	tagVotes: many(tagVotes),
	bookmarks: many(bookmarks),
	categorisations: many(categorisations),
	promptSuggestions: many(chatPromptSuggestions),
	augmentedSolution: one(augmentedSolutions, {
		fields: [exercises.id],
		references: [augmentedSolutions.exerciseId],
	}),
}));

export type Exercise = typeof exercises.$inferSelect;
export type NewExercise = typeof exercises.$inferInsert;
