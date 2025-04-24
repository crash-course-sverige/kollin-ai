import {
	foreignKey,
	integer,
	pgTable,
	serial,
	timestamp,
} from "drizzle-orm/pg-core";

import { orders } from "./orders.schema";
import { users } from "./users.schema";

/**
 * !!!
 *
 * INVESTIGATE WHY WE THERE IS TWO REFERRALS...
 * ONE UPPERCASE TABLE DEF AND ONE LOWERCASE...
 *
 * !!!
 */

export const Referrals = pgTable(
	"Referrals",
	{
		id: serial().notNull(),
		senderId: integer("sender_id").default(1),
		receiverId: integer("receiver_id"),
		orderId: integer("order_id"),
		createdAt: timestamp({ withTimezone: true, mode: "string" }).notNull(),
		updatedAt: timestamp({ withTimezone: true, mode: "string" }).notNull(),
	},
	(table) => {
		return [
			foreignKey({
				columns: [table.orderId],
				foreignColumns: [orders.id],
				name: "Referrals_order_id_fkey",
			}).onDelete("cascade"),
			foreignKey({
				columns: [table.receiverId],
				foreignColumns: [users.id],
				name: "Referrals_receiver_id_fkey",
			}).onDelete("cascade"),
			foreignKey({
				columns: [table.senderId],
				foreignColumns: [users.id],
				name: "Referrals_sender_id_fkey",
			}).onDelete("set default"),
		];
	},
);
