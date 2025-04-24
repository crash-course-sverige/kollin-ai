import { relations } from "drizzle-orm";
import {
	foreignKey,
	integer,
	pgTable,
	serial,
	timestamp,
	unique,
} from "drizzle-orm/pg-core";

import { coupons } from "./coupons.schema";
import { users } from "./users.schema";

export const couponUsage = pgTable(
	"coupon_usage",
	{
		id: serial().primaryKey().notNull(),
		userId: integer("user_id").default(1),
		couponId: integer("coupon_id"),
		createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
			.defaultNow()
			.notNull(),
	},
	(table) => {
		return [
			foreignKey({
				columns: [table.couponId],
				foreignColumns: [coupons.id],
				name: "coupon_usage_coupon_id_fkey",
			}),
			foreignKey({
				columns: [table.userId],
				foreignColumns: [users.id],
				name: "coupon_usage_user_id_fkey",
			}).onDelete("set default"),
			unique("unique_user_id_coupon_id").on(table.userId, table.couponId),
		];
	},
);

export const couponUsageRelations = relations(couponUsage, ({ one }) => ({
	coupon: one(coupons, {
		fields: [couponUsage.couponId],
		references: [coupons.id],
	}),
	user: one(users, {
		fields: [couponUsage.userId],
		references: [users.id],
	}),
}));

export type CouponUsage = typeof couponUsage.$inferSelect;
export type NewCouponUsage = typeof couponUsage.$inferInsert;
