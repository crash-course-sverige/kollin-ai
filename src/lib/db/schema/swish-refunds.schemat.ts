import { relations } from "drizzle-orm";
import {
	foreignKey,
	integer,
	pgTable,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";

import { orders } from "./orders.schema";

export const swishRefunds = pgTable(
	"swish_refunds",
	{
		id: varchar({ length: 255 }).primaryKey().notNull(),
		status: varchar({ length: 255 }),
		orderId: integer("order_id"),
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
				columns: [table.orderId],
				foreignColumns: [orders.id],
				name: "swish_refunds_order_id_fkey",
			}).onDelete("cascade"),
		];
	},
);

export const swishRefundsRelations = relations(swishRefunds, ({ one }) => ({
	order: one(orders, {
		fields: [swishRefunds.orderId],
		references: [orders.id],
	}),
}));

export type SwishRefund = typeof swishRefunds.$inferSelect;
export type NewSwishRefund = typeof swishRefunds.$inferInsert;
