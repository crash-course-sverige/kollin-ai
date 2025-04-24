import { relations } from "drizzle-orm";
import {
	foreignKey,
	index,
	integer,
	pgTable,
	serial,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";

import { users } from "./users.schema";

export const reactions = pgTable(
	"reactions",
	{
		id: serial().primaryKey().notNull(),
		name: varchar({ length: 255 }),
		createdAt: timestamp("created_at", {
			withTimezone: true,
			mode: "string",
		}).notNull(),
		updatedAt: timestamp("updated_at", {
			withTimezone: true,
			mode: "string",
		}).notNull(),
		userId: integer("user_id").notNull(),
		parentType: varchar("parent_type", { length: 255 }),
		parentId: integer("parent_id"),
	},
	(table) => {
		return [
			index("idx_reaction_parent_type_and_id").using(
				"btree",
				table.parentId.asc().nullsLast(),
				table.parentType.asc().nullsLast(),
			),
			index("idx_reactions_user_id").using(
				"btree",
				table.userId.asc().nullsLast(),
			),
			foreignKey({
				columns: [table.userId],
				foreignColumns: [users.id],
				name: "comment_reactions_user_id_fkey",
			}),
		];
	},
);

export const reactionsRelations = relations(reactions, ({ one }) => ({
	user: one(users, {
		fields: [reactions.userId],
		references: [users.id],
	}),
}));

export type Reaction = typeof reactions.$inferSelect;
export type NewReaction = typeof reactions.$inferInsert;
