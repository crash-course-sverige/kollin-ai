import { relations } from "drizzle-orm";
import {
	foreignKey,
	integer,
	pgTable,
	serial,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";

import { interactionResponses } from "./interaction-responses.schema";
import { users } from "./users.schema";

export const interactions = pgTable(
	"interactions",
	{
		id: serial().primaryKey().notNull(),
		type: varchar({ length: 255 }),
		options: varchar({ length: 255 }).array(),
		text: varchar({ length: 255 }),
		solution: varchar({ length: 255 }),
		createdBy: integer("created_by").default(1),
		parentId: integer("parent_id"),
		parentType: varchar("parent_type", { length: 255 }),
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
				columns: [table.createdBy],
				foreignColumns: [users.id],
				name: "interactions_created_by_fkey",
			}).onDelete("set default"),
		];
	},
);

export const interactionsRelations = relations(
	interactions,
	({ one, many }) => ({
		interactionResponses: many(interactionResponses),
		user: one(users, {
			fields: [interactions.createdBy],
			references: [users.id],
		}),
	}),
);

export type Interaction = typeof interactions.$inferSelect;
export type NewInteraction = typeof interactions.$inferInsert;
