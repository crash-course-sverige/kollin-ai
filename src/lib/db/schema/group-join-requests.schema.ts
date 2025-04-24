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

export const groupJoinRequests = pgTable(
	"group_join_requests",
	{
		id: uuid().primaryKey().notNull(),
		userId: integer("user_id"),
		groupId: uuid("group_id"),
		accepted: boolean().default(false).notNull(),
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
				columns: [table.userId],
				foreignColumns: [users.id],
				name: "group_join_requests_user_id_fkey",
			}).onDelete("cascade"),
			foreignKey({
				columns: [table.groupId],
				foreignColumns: [groups.id],
				name: "group_join_requests_group_id_fkey",
			}).onDelete("cascade"),
		];
	},
);

export const groupJoinRequestsRelations = relations(
	groupJoinRequests,
	({ one }) => ({
		user: one(users, {
			fields: [groupJoinRequests.userId],
			references: [users.id],
		}),
		group: one(groups, {
			fields: [groupJoinRequests.groupId],
			references: [groups.id],
		}),
	}),
);

export type GroupJoinRequest = typeof groupJoinRequests.$inferSelect;
export type NewGroupJoinRequest = typeof groupJoinRequests.$inferInsert;
