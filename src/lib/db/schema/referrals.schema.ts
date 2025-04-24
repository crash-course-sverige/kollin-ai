import { relations } from "drizzle-orm";
import {
	foreignKey,
	integer,
	pgTable,
	serial,
	timestamp,
} from "drizzle-orm/pg-core";

import { orders } from "./orders.schema";
import { users } from "./users.schema";

export const referrals = pgTable(
	"referrals",
	{
		id: serial().primaryKey().notNull(),
		createdAt: timestamp("created_at", {
			withTimezone: true,
			mode: "string",
		}).notNull(),
		updatedAt: timestamp("updated_at", {
			withTimezone: true,
			mode: "string",
		}).notNull(),
		senderId: integer("sender_id"),
		receiverId: integer("receiver_id"),
		orderId: integer("order_id"),
	},
	(table) => {
		return [
			foreignKey({
				columns: [table.orderId],
				foreignColumns: [orders.id],
				name: "referrals_order_id_fkey",
			})
				.onUpdate("cascade")
				.onDelete("set null"),
			foreignKey({
				columns: [table.receiverId],
				foreignColumns: [users.id],
				name: "referrals_receiver_id_fkey",
			})
				.onUpdate("cascade")
				.onDelete("set null"),
			foreignKey({
				columns: [table.senderId],
				foreignColumns: [users.id],
				name: "referrals_sender_id_fkey",
			})
				.onUpdate("cascade")
				.onDelete("set null"),
		];
	},
);

export const referralsRelations = relations(referrals, ({ one }) => ({
	order_orderId: one(orders, {
		fields: [referrals.orderId],
		references: [orders.id],
		relationName: "referrals_orderId_orders_id",
	}),
	user_receiverId: one(users, {
		fields: [referrals.receiverId],
		references: [users.id],
		relationName: "referrals_receiverId_users_id",
	}),
	user_senderId: one(users, {
		fields: [referrals.senderId],
		references: [users.id],
		relationName: "referrals_senderId_users_id",
	}),
}));

export type Referral = typeof referrals.$inferSelect;
export type NewReferral = typeof referrals.$inferInsert;
