import { relations } from "drizzle-orm";
import {
	foreignKey,
	integer,
	pgTable,
	serial,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";

import { categorisations } from "./categorisations.schema";
import { clusterings } from "./clusterings.schema";
import { subjects } from "./subjects.schema";

export const categories = pgTable(
	"categories",
	{
		id: serial().primaryKey().notNull(),
		name: varchar({ length: 255 }),
		subjectId: integer("subject_id"),
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
				columns: [table.subjectId],
				foreignColumns: [subjects.id],
				name: "categories_subject_id_fkey",
			}),
		];
	},
);

export const categoriesRelations = relations(categories, ({ one, many }) => ({
	subject: one(subjects, {
		fields: [categories.subjectId],
		references: [subjects.id],
	}),
	categorisations: many(categorisations),
	clusterings: many(clusterings),
}));

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
