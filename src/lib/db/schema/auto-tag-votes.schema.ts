import { relations } from "drizzle-orm";
import {
	doublePrecision,
	foreignKey,
	integer,
	pgTable,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";

import { exercises } from "./exercises.schema";
import { tags } from "./tags.schema";

export const autoTagVotes = pgTable(
	"auto_tag_votes",
	{
		tagId: integer("tag_id"),
		exerciseId: integer("exercise_id"),
		score: doublePrecision(),
		createdAt: timestamp("created_at", { mode: "string" }),
		botName: varchar("bot_name", { length: 255 }),
	},
	(table) => {
		return [
			foreignKey({
				columns: [table.exerciseId],
				foreignColumns: [exercises.id],
				name: "auto_tag_votes_exercise_id_fkey",
			}),
			foreignKey({
				columns: [table.tagId],
				foreignColumns: [tags.id],
				name: "exercise_locations_tag_id_fkey",
			})
				.onUpdate("cascade")
				.onDelete("cascade"),
		];
	},
);

export const autoTagVotesRelations = relations(autoTagVotes, ({ one }) => ({
	exercise: one(exercises, {
		fields: [autoTagVotes.exerciseId],
		references: [exercises.id],
	}),
	tag: one(tags, {
		fields: [autoTagVotes.tagId],
		references: [tags.id],
	}),
}));

export type AutoTagVote = typeof autoTagVotes.$inferSelect;
export type NewAutoTagVote = typeof autoTagVotes.$inferInsert;
