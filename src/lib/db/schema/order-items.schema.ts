import { relations } from "drizzle-orm";
import {
	foreignKey,
	index,
	integer,
	pgTable,
	serial,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";

import { orders } from "./orders.schema";

export const orderItems = pgTable(
	"order_items",
	{
		id: serial().primaryKey().notNull(),
		productId: integer("product_id"),
		productType: varchar("product_type", { length: 255 }),
		price: integer(),
		amountCents: integer("amount_cents"),
		quantity: integer(),
		orderId: integer("order_id").notNull(),
		createdAt: timestamp("created_at", {
			withTimezone: true,
			mode: "string",
		}).notNull(),
		updatedAt: timestamp("updated_at", {
			withTimezone: true,
			mode: "string",
		}).notNull(),
		productPriceId: varchar("product_price_id", { length: 255 }),
		expiryDate: timestamp("expiry_date", {
			withTimezone: true,
			mode: "string",
		}),
	},
	(table) => {
		return [
			index("order_items_product_id_product_type").using(
				"btree",
				table.productId.asc().nullsLast(),
				table.productType.asc().nullsLast(),
			),
			foreignKey({
				columns: [table.orderId],
				foreignColumns: [orders.id],
				name: "order_items_order_id_fkey",
			}).onDelete("cascade"),
		];
	},
);

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
	order: one(orders, {
		fields: [orderItems.orderId],
		references: [orders.id],
	}),
}));

export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;
