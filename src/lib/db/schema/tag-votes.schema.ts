import { relations } from "drizzle-orm";
import {
	boolean,
	foreignKey,
	integer,
	pgTable,
	timestamp,
	unique,
} from "drizzle-orm/pg-core";

import { exercises } from "./exercises.schema";
import { tags } from "./tags.schema";
import { users } from "./users.schema";

export const tagVotes = pgTable(
	"tag_votes",
	{
		tagId: integer("tag_id"),
		userId: integer("user_id"),
		exerciseId: integer("exercise_id"),
		createdAt: timestamp("created_at", { mode: "string" }),
		validated: boolean(),
		imitated: boolean(),
	},
	(table) => {
		return [
			foreignKey({
				columns: [table.tagId],
				foreignColumns: [tags.id],
				name: "exercise_locations_tag_id_fkey",
			})
				.onUpdate("cascade")
				.onDelete("cascade"),
			foreignKey({
				columns: [table.exerciseId],
				foreignColumns: [exercises.id],
				name: "tag_votes_exercise_id_fkey",
			}).onDelete("cascade"),
			foreignKey({
				columns: [table.userId],
				foreignColumns: [users.id],
				name: "tag_votes_user_id_fkey",
			}),
			unique("tag_votes_tag_id_exercise_id_user_id_key").on(
				table.tagId,
				table.userId,
				table.exerciseId,
			),
		];
	},
);

export const tagVotesRelations = relations(tagVotes, ({ one }) => ({
	tag: one(tags, {
		fields: [tagVotes.tagId],
		references: [tags.id],
	}),
	exercise: one(exercises, {
		fields: [tagVotes.exerciseId],
		references: [exercises.id],
	}),
	user: one(users, {
		fields: [tagVotes.userId],
		references: [users.id],
	}),
}));

export type TagVote = typeof tagVotes.$inferSelect;
export type NewTagVote = typeof tagVotes.$inferInsert;
