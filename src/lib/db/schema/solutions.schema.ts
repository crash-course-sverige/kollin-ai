import { relations } from "drizzle-orm";
import {
	boolean,
	foreignKey,
	index,
	integer,
	pgTable,
	serial,
	text,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";

import { exercises } from "./exercises.schema";
import { solutionsOcr } from "./solutions-ocr.schema";
import { users } from "./users.schema";

export const solutions = pgTable(
	"solutions",
	{
		id: serial().primaryKey().notNull(),
		format: varchar({ length: 255 }).notNull(),
		exerciseId: integer("exercise_id"),
		y: integer(),
		h: integer(),
		w: integer(),
		html: text(),
		createdBy: integer("created_by").default(1),
		createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
			.defaultNow()
			.notNull(),
		imageUrl: varchar("image_url"),
		published: boolean().default(false).notNull(),
	},
	(table) => {
		return [
			index("idx_solutions_exercise_id").using(
				"btree",
				table.exerciseId.asc().nullsLast(),
			),
			foreignKey({
				columns: [table.createdBy],
				foreignColumns: [users.id],
				name: "solutions_created_by_fkey",
			}).onDelete("set null"),
			foreignKey({
				columns: [table.exerciseId],
				foreignColumns: [exercises.id],
				name: "solutions_exercise_id_fkey",
			}).onDelete("cascade"),
		];
	},
);

export const solutionsRelations = relations(solutions, ({ one, many }) => ({
	solutionsOcrs: many(solutionsOcr),
	user: one(users, {
		fields: [solutions.createdBy],
		references: [users.id],
	}),
	exercise: one(exercises, {
		fields: [solutions.exerciseId],
		references: [exercises.id],
	}),
}));

export type Solution = typeof solutions.$inferSelect;
export type NewSolution = typeof solutions.$inferInsert;
