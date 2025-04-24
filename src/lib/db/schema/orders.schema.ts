import { relations } from "drizzle-orm";
import {
	foreignKey,
	index,
	integer,
	pgTable,
	serial,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";

import { courses } from "./courses.schema";
import { orderItems } from "./order-items.schema";
import { referrals } from "./referrals.schema";
import { swishRefunds } from "./swish-refunds.schemat";
import { users } from "./users.schema";

export const orders = pgTable(
	"orders",
	{
		id: serial().primaryKey().notNull(),
		amountCents: integer("amount_cents"),
		amountCurrency: varchar("amount_currency", { length: 255 }),
		userId: integer("user_id"),
		courseId: integer("course_id"),
		createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
			.defaultNow()
			.notNull(),
		chargeId: varchar("charge_id", { length: 255 }),
		paymentMethod: varchar("payment_method", { length: 255 }),
		status: varchar({ length: 255 }),
		discount: integer(),
		discountCouponId: uuid("discount_coupon_id"),
	},
	(table) => {
		return [
			index("orders_user_id_idx").using(
				"btree",
				table.userId.asc().nullsLast(),
			),
			foreignKey({
				columns: [table.courseId],
				foreignColumns: [courses.id],
				name: "orders_course_id_fkey",
			}).onDelete("cascade"),
			foreignKey({
				columns: [table.userId],
				foreignColumns: [users.id],
				name: "orders_user_id_fkey",
			}).onDelete("cascade"),
		];
	},
);

export const ordersRelations = relations(orders, ({ one, many }) => ({
	referrals_orderId: many(referrals, {
		relationName: "referrals_orderId_orders_id",
	}),
	swishRefunds: many(swishRefunds),
	course: one(courses, {
		fields: [orders.courseId],
		references: [courses.id],
	}),
	user: one(users, {
		fields: [orders.userId],
		references: [users.id],
	}),
	orderItems: many(orderItems),
}));

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
