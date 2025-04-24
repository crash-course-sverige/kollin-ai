import { relations } from "drizzle-orm";
import {
	foreignKey,
	integer,
	pgTable,
	serial,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";

import { courses } from "./courses.schema";
import { users } from "./users.schema";

export const clusterGroups = pgTable(
	"cluster_groups",
	{
		id: serial().primaryKey().notNull(),
		name: varchar({ length: 255 }),
		courseId: integer("course_id"),
		userId: integer("user_id").default(1),
		createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
			.defaultNow()
			.notNull(),
	},
	(table) => {
		return [
			foreignKey({
				columns: [table.courseId],
				foreignColumns: [courses.id],
				name: "cluster_groups_course_id_fkey",
			}).onDelete("cascade"),
			foreignKey({
				columns: [table.userId],
				foreignColumns: [users.id],
				name: "cluster_groups_user_id_fkey",
			}),
		];
	},
);

export const clusterGroupsRelations = relations(clusterGroups, ({ one }) => ({
	course: one(courses, {
		fields: [clusterGroups.courseId],
		references: [courses.id],
	}),
	user: one(users, {
		fields: [clusterGroups.userId],
		references: [users.id],
	}),
}));

export type ClusterGroup = typeof clusterGroups.$inferSelect;
export type NewClusterGroup = typeof clusterGroups.$inferInsert;
