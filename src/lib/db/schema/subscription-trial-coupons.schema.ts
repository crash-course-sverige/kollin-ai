import { relations } from "drizzle-orm";
import {
	boolean,
	foreignKey,
	index,
	integer,
	pgTable,
	timestamp,
	unique,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";

import { subscriptionPlans } from "./subscription-plans.schema";
import { users } from "./users.schema";

export const subscriptionTrialCoupons = pgTable(
	"subscription_trial_coupons",
	{
		id: uuid().primaryKey().notNull(),
		redeemed: boolean().default(false).notNull(),
		trialDays: integer("trial_days").notNull(),
		expiryDate: timestamp("expiry_date", {
			withTimezone: true,
			mode: "string",
		}).notNull(),
		campaignName: varchar("campaign_name", { length: 255 }),
		userId: integer("user_id"),
		subscriptionPlanId: integer("subscription_plan_id").notNull(),
		createdAt: timestamp("created_at", {
			withTimezone: true,
			mode: "string",
		}).notNull(),
		updatedAt: timestamp("updated_at", {
			withTimezone: true,
			mode: "string",
		}).notNull(),
		name: varchar({ length: 255 }),
		cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
	},
	(table) => {
		return [
			index("subscription_trial_coupons_user_id").using(
				"btree",
				table.userId.asc().nullsLast(),
			),
			foreignKey({
				columns: [table.subscriptionPlanId],
				foreignColumns: [subscriptionPlans.id],
				name: "subscription_trial_coupons_subscription_plan_id_fkey",
			}).onDelete("cascade"),
			foreignKey({
				columns: [table.userId],
				foreignColumns: [users.id],
				name: "subscription_trial_coupons_user_id_fkey",
			}).onDelete("cascade"),
			unique("subscription_trial_coupons_name_key").on(table.name),
		];
	},
);

export const subscriptionTrialCouponsRelations = relations(
	subscriptionTrialCoupons,
	({ one }) => ({
		subscriptionPlan: one(subscriptionPlans, {
			fields: [subscriptionTrialCoupons.subscriptionPlanId],
			references: [subscriptionPlans.id],
		}),
		user: one(users, {
			fields: [subscriptionTrialCoupons.userId],
			references: [users.id],
		}),
	}),
);

export type SubscriptionTrialCoupon =
	typeof subscriptionTrialCoupons.$inferSelect;
export type NewSubscriptionTrialCoupon =
	typeof subscriptionTrialCoupons.$inferInsert;
