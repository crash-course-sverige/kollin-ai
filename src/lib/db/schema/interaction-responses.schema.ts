import { relations } from "drizzle-orm";
import {
	boolean,
	foreignKey,
	integer,
	pgTable,
	serial,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";

import { interactions } from "./interactions.schema";

export const interactionResponses = pgTable(
	"interaction_responses",
	{
		id: serial().primaryKey().notNull(),
		answer: varchar({ length: 255 }),
		correct: boolean(),
		userId: integer("user_id"),
		interactionId: integer("interaction_id"),
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
				columns: [table.interactionId],
				foreignColumns: [interactions.id],
				name: "interaction_responses_interaction_id_fkey",
			}).onDelete("cascade"),
		];
	},
);

export const interactionResponsesRelations = relations(
	interactionResponses,
	({ one }) => ({
		interaction: one(interactions, {
			fields: [interactionResponses.interactionId],
			references: [interactions.id],
		}),
	}),
);

export type InteractionResponse = typeof interactionResponses.$inferSelect;
export type NewInteractionResponse = typeof interactionResponses.$inferInsert;
