import { relations } from "drizzle-orm";
import {
	foreignKey,
	integer,
	pgTable,
	primaryKey,
	timestamp,
} from "drizzle-orm/pg-core";

import { categories } from "./categories.schema";
import { modules } from "./modules.schema";

export const clusterings = pgTable(
	"clusterings",
	{
		clusterId: integer("cluster_id").notNull(),
		categoryId: integer("category_id").notNull(),
		ordering: integer(),
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
				columns: [table.categoryId],
				foreignColumns: [categories.id],
				name: "clusterings_category_id_fkey",
			})
				.onUpdate("cascade")
				.onDelete("cascade"),
			foreignKey({
				columns: [table.clusterId],
				foreignColumns: [modules.id],
				name: "clusterings_cluster_id_fkey",
			})
				.onUpdate("cascade")
				.onDelete("cascade"),
			primaryKey({
				columns: [table.clusterId, table.categoryId],
				name: "clusterings_pkey",
			}),
		];
	},
);

export const clusteringsRelations = relations(clusterings, ({ one }) => ({
	category: one(categories, {
		fields: [clusterings.categoryId],
		references: [categories.id],
	}),
	module: one(modules, {
		fields: [clusterings.clusterId],
		references: [modules.id],
	}),
}));

export type Clustering = typeof clusterings.$inferSelect;
export type NewClustering = typeof clusterings.$inferInsert;
