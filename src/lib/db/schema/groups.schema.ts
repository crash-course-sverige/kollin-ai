import { relations } from "drizzle-orm";
import {
	boolean,
	foreignKey,
	integer,
	pgTable,
	text,
	timestamp,
	unique,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";

import { discountCoupons } from "./discount-coupons.schema";
import { groupContacts } from "./group-contacts.schema";
import { groupJoinRequests } from "./group-join-requests.schema";
import { groupLinks } from "./group-links.schema";
import { groupMemberInvites } from "./group-member-invites.schema";
import { groupMembers } from "./group-members.schema";
import { programs } from "./programs.schema";
import { schools } from "./schools.schema";
import { users } from "./users.schema";

export const groups = pgTable(
	"groups",
	{
		id: uuid().primaryKey().notNull(),
		key: varchar({ length: 255 }).notNull(),
		name: varchar({ length: 255 }).notNull(),
		description: text(),
		imageUrl: varchar("image_url", { length: 255 }),
		hidden: boolean().default(true).notNull(),
		membershipRequiresValidation: boolean("membership_requires_validation")
			.default(true)
			.notNull(),
		userId: integer("user_id").default(1).notNull(),
		parentGroupId: uuid("parent_group_id"),
		programId: integer("program_id"),
		introduction: text("introduction"),
		createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
			.defaultNow()
			.notNull(),
		schoolId: integer("school_id"),
	},
	(table) => {
		return [
			foreignKey({
				columns: [table.userId],
				foreignColumns: [users.id],
				name: "groups_user_id_fkey",
			}).onDelete("set default"),
			foreignKey({
				columns: [table.parentGroupId],
				foreignColumns: [table.id],
				name: "groups_parent_group_id_fkey",
			}).onDelete("set null"),
			foreignKey({
				columns: [table.programId],
				foreignColumns: [programs.id],
				name: "groups_program_id_fkey",
			}).onDelete("set null"),
			foreignKey({
				columns: [table.schoolId],
				foreignColumns: [schools.id],
				name: "groups_school_id_fkey",
			})
				.onUpdate("cascade")
				.onDelete("set null"),
			unique("groups_key_key").on(table.key),
		];
	},
);

export const groupsRelations = relations(groups, ({ one, many }) => ({
	discountCoupons: many(discountCoupons),
	groupMemberInvites: many(groupMemberInvites),
	groupMembers: many(groupMembers),
	groupJoinRequests: many(groupJoinRequests),
	groupContacts: many(groupContacts),
	groupLinks: many(groupLinks),
	user: one(users, {
		fields: [groups.userId],
		references: [users.id],
	}),
	group: one(groups, {
		fields: [groups.parentGroupId],
		references: [groups.id],
		relationName: "groups_parentGroupId_groups_id",
	}),
	groups: many(groups, {
		relationName: "groups_parentGroupId_groups_id",
	}),
	program: one(programs, {
		fields: [groups.programId],
		references: [programs.id],
	}),
	school: one(schools, {
		fields: [groups.schoolId],
		references: [schools.id],
	}),
}));

export type Group = typeof groups.$inferSelect;
export type NewGroup = typeof groups.$inferInsert;
