import { relations } from "drizzle-orm";
import {
	pgTable,
	serial,
	timestamp,
	unique,
	varchar,
} from "drizzle-orm/pg-core";

import { coupons } from "./coupons.schema";
import { courses } from "./courses.schema";
import { groups } from "./groups.schema";
import { programs } from "./programs.schema";
import { users } from "./users.schema";

export const schools = pgTable(
	"schools",
	{
		id: serial().primaryKey().notNull(),
		name: varchar({ length: 255 }),
		nickname: varchar({ length: 255 }),
		createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
			.defaultNow()
			.notNull(),
	},
	(table) => {
		return [unique("schools_name_key").on(table.name)];
	},
);

export const schoolsRelations = relations(schools, ({ many }) => ({
	coupons: many(coupons),
	courses: many(courses),
	users: many(users),
	programs: many(programs),
	groups: many(groups),
}));

export type School = typeof schools.$inferSelect;
export type NewSchool = typeof schools.$inferInsert;
