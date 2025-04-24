import { relations } from "drizzle-orm";
import {
	boolean,
	foreignKey,
	integer,
	pgTable,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";

import { groups } from "./groups.schema";
import { users } from "./users.schema";

export const groupMembers = pgTable(
	"group_members",
	{
		id: uuid().primaryKey().defaultRandom().notNull(),
		admin: boolean().default(false).notNull(),
		createdAt: timestamp("created_at", {
			withTimezone: true,
			mode: "string",
		})
			.notNull()
			.defaultNow(),
		updatedAt: timestamp("updated_at", {
			withTimezone: true,
			mode: "string",
		})
			.notNull()
			.defaultNow(),
		groupId: uuid("group_id").notNull(),
		userId: integer("user_id").notNull(),
		verified: boolean().default(false).notNull(),
		moderator: boolean().default(false),
	},
	(table) => {
		return [
			foreignKey({
				columns: [table.groupId],
				foreignColumns: [groups.id],
				name: "group_members_group_id_fkey",
			}).onDelete("cascade"),
			foreignKey({
				columns: [table.userId],
				foreignColumns: [users.id],
				name: "group_members_user_id_fkey",
			}).onDelete("cascade"),
		];
	},
);

export const groupMembersRelations = relations(groupMembers, ({ one }) => ({
	group: one(groups, {
		fields: [groupMembers.groupId],
		references: [groups.id],
	}),
	user: one(users, {
		fields: [groupMembers.userId],
		references: [users.id],
	}),
}));

export type GroupMember = typeof groupMembers.$inferSelect;
export type NewGroupMember = typeof groupMembers.$inferInsert;
