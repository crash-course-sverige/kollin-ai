import { relations } from "drizzle-orm";
import {
	foreignKey,
	integer,
	pgTable,
	serial,
	timestamp,
} from "drizzle-orm/pg-core";

import { categories } from "./categories.schema";
import { exercises } from "./exercises.schema";
import { users } from "./users.schema";

export const categorisations = pgTable(
	"categorisations",
	{
		id: serial().primaryKey().notNull(),
		exerciseId: integer("exercise_id"),
		categoryId: integer("category_id"),
		categorisedBy: integer("categorised_by").default(1),
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
				columns: [table.categorisedBy],
				foreignColumns: [users.id],
				name: "categorisations_categorised_by_fkey",
			}),
			foreignKey({
				columns: [table.categoryId],
				foreignColumns: [categories.id],
				name: "categorisations_category_id_fkey",
			}).onDelete("cascade"),
			foreignKey({
				columns: [table.exerciseId],
				foreignColumns: [exercises.id],
				name: "categorisations_exercise_id_fkey",
			}).onDelete("cascade"),
		];
	},
);

export const categorisationsRelations = relations(
	categorisations,
	({ one }) => ({
		user: one(users, {
			fields: [categorisations.categorisedBy],
			references: [users.id],
		}),
		category: one(categories, {
			fields: [categorisations.categoryId],
			references: [categories.id],
		}),
		exercise: one(exercises, {
			fields: [categorisations.exerciseId],
			references: [exercises.id],
		}),
	}),
);

export type Categorisation = typeof categorisations.$inferSelect;
export type NewCategorisation = typeof categorisations.$inferInsert;
