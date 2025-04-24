import { relations } from "drizzle-orm";
import {
	boolean,
	foreignKey,
	index,
	integer,
	json,
	pgTable,
	serial,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";

import { users } from "./users.schema";

export const notifications = pgTable(
	"notifications",
	{
		id: serial().primaryKey().notNull(),
		type: varchar({ length: 255 }).notNull(),
		read: boolean().default(false),
		objectType: varchar("object_type", { length: 255 }),
		objectId: integer("object_id"),
		data: json(),
		url: varchar({ length: 255 }),
		senderId: integer("sender_id").notNull(),
		recipientId: integer("recipient_id").notNull(),
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
			index("notifications_recipient_id").using(
				"btree",
				table.recipientId.asc().nullsLast(),
			),
			foreignKey({
				columns: [table.recipientId],
				foreignColumns: [users.id],
				name: "notifications_recipient_id_fkey",
			}),
			foreignKey({
				columns: [table.senderId],
				foreignColumns: [users.id],
				name: "notifications_sender_id_fkey",
			}),
		];
	},
);

export const notificationsRelations = relations(notifications, ({ one }) => ({
	user_recipientId: one(users, {
		fields: [notifications.recipientId],
		references: [users.id],
		relationName: "notifications_recipientId_users_id",
	}),
	user_senderId: one(users, {
		fields: [notifications.senderId],
		references: [users.id],
		relationName: "notifications_senderId_users_id",
	}),
}));

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
