import { relations } from "drizzle-orm";
import {
	foreignKey,
	index,
	integer,
	pgTable,
	text,
	timestamp,
	vector,
} from "drizzle-orm/pg-core";

import { solutions } from "./solutions.schema";

export const solutionsOcr = pgTable(
	"solutions_ocr",
	{
		solutionId: integer("solution_id").primaryKey().notNull(),
		ocrResult: text("ocr_result"),
		updatedAt: timestamp("updated_at", { mode: "string" }),
		embedding: vector("embedding", { dimensions: 1536 }),
	},
	(table) => {
		return [
			index("solutions_ocr_embedding_idx").using(
				"hnsw",
				table.embedding.asc().nullsLast().op("vector_cosine_ops"),
			),
			index("solutions_ocr_solution_id").using(
				"btree",
				table.solutionId.asc().nullsLast(),
			),
			foreignKey({
				columns: [table.solutionId],
				foreignColumns: [solutions.id],
				name: "solutions_ocr_solutions_fkey",
			})
				.onUpdate("cascade")
				.onDelete("cascade"),
		];
	},
);

export const solutionsOcrRelations = relations(solutionsOcr, ({ one }) => ({
	solution: one(solutions, {
		fields: [solutionsOcr.solutionId],
		references: [solutions.id],
	}),
}));

export type SolutionsOcr = typeof solutionsOcr.$inferSelect;
export type NewSolutionsOcr = typeof solutionsOcr.$inferInsert;
