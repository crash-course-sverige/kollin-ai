import { relations } from "drizzle-orm";
import {
	boolean,
	integer,
	pgTable,
	serial,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";

import { subscriptionTrialCoupons } from "./subscription-trial-coupons.schema";

export const subscriptionPlans = pgTable("subscription_plans", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 255 }),
	price: integer(),
	interval: varchar({ length: 255 }),
	trialDays: varchar("trial_days", { length: 255 }),
	pricingId: varchar("pricing_id", { length: 255 }),
	createdAt: timestamp("created_at", {
		withTimezone: true,
		mode: "string",
	}).notNull(),
	updatedAt: timestamp("updated_at", {
		withTimezone: true,
		mode: "string",
	}).notNull(),
	active: boolean(),
});

export const subscriptionPlansRelations = relations(
	subscriptionPlans,
	({ many }) => ({
		subscriptionTrialCoupons: many(subscriptionTrialCoupons),
	}),
);

export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type NewSubscriptionPlan = typeof subscriptionPlans.$inferInsert;
