import { relations } from "drizzle-orm";
import {
	boolean,
	doublePrecision,
	foreignKey,
	index,
	integer,
	jsonb,
	pgTable,
	text,
	timestamp,
	uuid,
	varchar,
	vector,
} from "drizzle-orm/pg-core";

import { users } from "./users.schema";

export type SubProblem = {
	sub_problem_number?: string | null;
	statement?: string | null;
	solution?: string | null;
	answer?: string | null;
	points?: number | null;
};

export const textData = pgTable(
	"text_data",
	{
		id: uuid().primaryKey().notNull(),
		parentId: integer("parent_id").notNull(),
		parentType: varchar("parent_type", { length: 255 }).notNull(),
		revision: integer().default(0).notNull(),
		text: text().notNull(),
		handwritten: boolean(),
		confidence: doublePrecision(),
		confidenceRate: doublePrecision("confidence_rate"),
		source: varchar({ length: 255 }),
		userId: integer("user_id").default(1).notNull(),
		embedding: vector("embedding", { dimensions: 1536 }),
		subProblems: jsonb("sub_problems").$type<SubProblem[]>(),
		answer: text("answer"),
		createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
			.defaultNow()
			.notNull(),
		validated: boolean().default(false),
	},
	(table) => {
		return [
			index("text_data_parent_id_parent_type").using(
				"btree",
				table.parentId.asc().nullsLast(),
				table.parentType.asc().nullsLast(),
			),
			index("text_data_user_id").using("btree", table.userId.asc().nullsLast()),
			foreignKey({
				columns: [table.userId],
				foreignColumns: [users.id],
				name: "text_data_user_id_fkey",
			}).onDelete("set default"),
		];
	},
);

export const textDataRelations = relations(textData, ({ one }) => ({
	user: one(users, {
		fields: [textData.userId],
		references: [users.id],
	}),
}));

export type TextData = typeof textData.$inferSelect;
export type NewTextData = typeof textData.$inferInsert;
