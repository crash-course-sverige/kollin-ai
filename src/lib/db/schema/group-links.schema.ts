import { relations } from "drizzle-orm";
import { foreignKey, pgTable, uuid, varchar } from "drizzle-orm/pg-core";

import { groups } from "./groups.schema";

export const groupLinks = pgTable(
	"group_links",
	{
		id: uuid().primaryKey().defaultRandom().notNull(),
		groupId: uuid("group_id").notNull(),
		url: varchar({ length: 2048 }).notNull(),
		icon: varchar({ length: 255 }),
		color: varchar({ length: 50 }),
		title: varchar({ length: 255 }).notNull(),
		imageUrl: varchar({ length: 2048 }),
	},
	(table) => {
		return [
			foreignKey({
				columns: [table.groupId],
				foreignColumns: [groups.id],
				name: "group_links_group_id_fkey",
			})
				.onDelete("cascade")
				.onUpdate("cascade"),
		];
	},
);

export const groupLinksRelations = relations(groupLinks, ({ one }) => ({
	group: one(groups, {
		fields: [groupLinks.groupId],
		references: [groups.id],
	}),
}));

export type GroupLink = typeof groupLinks.$inferSelect;
export type NewGroupLink = typeof groupLinks.$inferInsert;
