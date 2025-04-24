import { relations } from "drizzle-orm";
import {
	boolean,
	foreignKey,
	integer,
	pgTable,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";

import { groups } from "./groups.schema";
import { users } from "./users.schema";

export const groupMemberInvites = pgTable(
	"group_member_invites",
	{
		id: uuid().primaryKey().notNull(),
		email: varchar({ length: 255 }).notNull(),
		userId: integer("user_id"),
		groupId: uuid("group_id"),
		inviteToken: varchar("invite_token", { length: 255 }).notNull(),
		accepted: boolean().default(false),
		invitedBy: integer("invited_by").default(1).notNull(),
		createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
			.defaultNow()
			.notNull(),
		verified: boolean().default(false).notNull(),
	},
	(table) => {
		return [
			foreignKey({
				columns: [table.userId],
				foreignColumns: [users.id],
				name: "group_member_invites_user_id_fkey",
			}).onDelete("cascade"),
			foreignKey({
				columns: [table.groupId],
				foreignColumns: [groups.id],
				name: "group_member_invites_group_id_fkey",
			}).onDelete("cascade"),
			foreignKey({
				columns: [table.invitedBy],
				foreignColumns: [users.id],
				name: "group_member_invites_invited_by_fkey",
			}).onDelete("set default"),
		];
	},
);

export const groupMemberInvitesRelations = relations(
	groupMemberInvites,
	({ one }) => ({
		user_userId: one(users, {
			fields: [groupMemberInvites.userId],
			references: [users.id],
			relationName: "groupMemberInvites_userId_users_id",
		}),
		group: one(groups, {
			fields: [groupMemberInvites.groupId],
			references: [groups.id],
		}),
		user_invitedBy: one(users, {
			fields: [groupMemberInvites.invitedBy],
			references: [users.id],
			relationName: "groupMemberInvites_invitedBy_users_id",
		}),
	}),
);

export type GroupMemberInvite = typeof groupMemberInvites.$inferSelect;
export type NewGroupMemberInvite = typeof groupMemberInvites.$inferInsert;
