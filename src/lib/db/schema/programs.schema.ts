import { relations } from "drizzle-orm";
import {
	foreignKey,
	integer,
	pgTable,
	serial,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";

import { coupons } from "./coupons.schema";
import { groups } from "./groups.schema";
import { programCourses } from "./program-courses.schema";
import { schools } from "./schools.schema";
import { users } from "./users.schema";

export const programs = pgTable(
	"programs",
	{
		id: serial().primaryKey().notNull(),
		name: varchar({ length: 255 }),
		schoolId: integer("school_id"),
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
				columns: [table.schoolId],
				foreignColumns: [schools.id],
				name: "programs_school_id_fkey",
			}),
		];
	},
);

export const programsRelations = relations(programs, ({ one, many }) => ({
	programCourses: many(programCourses),
	coupons: many(coupons),
	users: many(users),
	school: one(schools, {
		fields: [programs.schoolId],
		references: [schools.id],
	}),
	groups: many(groups),
}));

export type Program = typeof programs.$inferSelect;
export type NewProgram = typeof programs.$inferInsert;
