import { relations } from "drizzle-orm";
import {
	boolean,
	foreignKey,
	integer,
	pgTable,
	timestamp,
	unique,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";

import { groups } from "./groups.schema";

export const discountCoupons = pgTable(
	"discount_coupons",
	{
		id: uuid().primaryKey().notNull(),
		name: varchar({ length: 255 }).notNull(),
		description: varchar({ length: 1000 }),
		issuerName: varchar("issuer_name", { length: 255 }).notNull(),
		discountPercentage: integer("discount_percentage").notNull(),
		expiryDate: timestamp("expiry_date", {
			withTimezone: true,
			mode: "string",
		}).notNull(),
		stripeCouponId: varchar("stripe_coupon_id", { length: 255 }),
		active: boolean().default(true).notNull(),
		groupId: uuid("group_id"),
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
				columns: [table.groupId],
				foreignColumns: [groups.id],
				name: "discount_coupons_group_id_fkey",
			}),
			unique("discount_coupons_name_key").on(table.name),
		];
	},
);

export const discountCouponsRelations = relations(
	discountCoupons,
	({ one }) => ({
		group: one(groups, {
			fields: [discountCoupons.groupId],
			references: [groups.id],
		}),
	}),
);

export type DiscountCoupon = typeof discountCoupons.$inferSelect;
export type NewDiscountCoupon = typeof discountCoupons.$inferInsert;
