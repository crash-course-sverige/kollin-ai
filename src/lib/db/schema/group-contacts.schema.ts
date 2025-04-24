import { relations } from "drizzle-orm";
import { foreignKey, pgTable, uuid, varchar } from "drizzle-orm/pg-core";

import { groupMembers } from "./group-members.schema";
import { groups } from "./groups.schema";

export const groupContacts = pgTable(
	"group_contacts",
	{
		id: uuid().primaryKey().defaultRandom().notNull(),
		groupId: uuid("group_id").notNull(),
		name: varchar("name", { length: 255 }),
		role: varchar("role", { length: 255 }),
		email: varchar("email", { length: 255 }),
		phone: varchar("phone", { length: 50 }),
		groupMemberId: uuid("group_member_id"),
	},
	(table) => {
		return [
			foreignKey({
				columns: [table.groupId],
				foreignColumns: [groups.id],
				name: "group_contacts_group_id_fkey",
			})
				.onDelete("cascade")
				.onUpdate("cascade"),
			foreignKey({
				columns: [table.groupMemberId],
				foreignColumns: [groupMembers.id],
				name: "group_contacts_group_member_id_fkey",
			})
				.onDelete("set null")
				.onUpdate("cascade"),
		];
	},
);

export const groupContactsRelations = relations(groupContacts, ({ one }) => ({
	group: one(groups, {
		fields: [groupContacts.groupId],
		references: [groups.id],
	}),
	groupMember: one(groupMembers, {
		fields: [groupContacts.groupMemberId],
		references: [groupMembers.id],
	}),
}));

export type GroupContact = typeof groupContacts.$inferSelect;
export type NewGroupContact = typeof groupContacts.$inferInsert;
