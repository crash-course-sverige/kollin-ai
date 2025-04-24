import { relations } from "drizzle-orm";
import {
	foreignKey,
	integer,
	pgTable,
	serial,
	timestamp,
	unique,
	varchar,
} from "drizzle-orm/pg-core";

import { couponUsage } from "./coupon-usage.schema";
import { courses } from "./courses.schema";
import { programs } from "./programs.schema";
import { schools } from "./schools.schema";
import { users } from "./users.schema";

export const coupons = pgTable(
	"coupons",
	{
		id: serial().primaryKey().notNull(),
		name: varchar({ length: 255 }),
		issuerName: varchar("issuer_name", { length: 255 }),
		type: varchar({ length: 255 }),
		expiryDate: timestamp("expiry_date", {
			withTimezone: true,
			mode: "string",
		}).notNull(),
		amount: integer().notNull(),
		createdAt: timestamp("created_at", {
			withTimezone: true,
			mode: "string",
		}).notNull(),
		updatedAt: timestamp("updated_at", {
			withTimezone: true,
			mode: "string",
		}).notNull(),
		courseId: integer("course_id"),
		trialDays: integer("trial_days").default(0),
		programId: integer("program_id"),
		schoolId: integer("school_id"),
		issuerId: integer("issuer_id").default(1),
	},
	(table) => {
		return [
			foreignKey({
				columns: [table.courseId],
				foreignColumns: [courses.id],
				name: "coupons_course_id_fkey",
			}).onDelete("cascade"),
			foreignKey({
				columns: [table.issuerId],
				foreignColumns: [users.id],
				name: "coupons_issuer_id_fkey",
			}).onDelete("cascade"),
			foreignKey({
				columns: [table.programId],
				foreignColumns: [programs.id],
				name: "coupons_program_id_fkey",
			}),
			foreignKey({
				columns: [table.schoolId],
				foreignColumns: [schools.id],
				name: "coupons_school_id_fkey",
			}),
			unique("coupons_name_key").on(table.name),
		];
	},
);

export const couponsRelations = relations(coupons, ({ one, many }) => ({
	couponUsages: many(couponUsage),
	course: one(courses, {
		fields: [coupons.courseId],
		references: [courses.id],
	}),
	user: one(users, {
		fields: [coupons.issuerId],
		references: [users.id],
	}),
	program: one(programs, {
		fields: [coupons.programId],
		references: [programs.id],
	}),
	school: one(schools, {
		fields: [coupons.schoolId],
		references: [schools.id],
	}),
}));

export type Coupon = typeof coupons.$inferSelect;
export type NewCoupon = typeof coupons.$inferInsert;
