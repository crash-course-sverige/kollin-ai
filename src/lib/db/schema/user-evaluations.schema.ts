import { relations } from "drizzle-orm";
import {
	foreignKey,
	index,
	integer,
	json,
	pgTable,
	serial,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";

import { users } from "./users.schema";

export const userEvaluations = pgTable(
	"user_evaluations",
	{
		id: serial().primaryKey().notNull(),
		objectName: varchar("object_name", { length: 255 }).notNull(),
		objectId: varchar("object_id", { length: 255 }).notNull(),
		evaluation: json(),
		source: varchar({ length: 255 }),
		userId: integer("user_id").notNull(),
		createdAt: timestamp("created_at", {
			withTimezone: true,
			mode: "string",
		}).notNull(),
		updatedAt: timestamp("updated_at", {
			withTimezone: true,
			mode: "string",
		}).notNull(),
	},
	(table) => {
		return [
			index("user_evaluations_object_id").using(
				"btree",
				table.objectId.asc().nullsLast(),
			),
			index("user_evaluations_object_name").using(
				"btree",
				table.objectName.asc().nullsLast(),
			),
			index("user_evaluations_object_name_and_id").using(
				"btree",
				table.objectName.asc().nullsLast(),
				table.objectId.asc().nullsLast(),
			),
			index("user_evaluations_object_source_and_user").using(
				"btree",
				table.userId.asc().nullsLast(),
				table.source.asc().nullsLast(),
				table.objectName.asc().nullsLast(),
				table.objectId.asc().nullsLast(),
			),
			index("user_evaluations_source").using(
				"btree",
				table.source.asc().nullsLast(),
			),
			index("user_evaluations_user_id").using(
				"btree",
				table.userId.asc().nullsLast(),
			),
			foreignKey({
				columns: [table.userId],
				foreignColumns: [users.id],
				name: "user_evaluations_user_id_fkey",
			}),
		];
	},
);

export const userEvaluationsRelations = relations(
	userEvaluations,
	({ one }) => ({
		user: one(users, {
			fields: [userEvaluations.userId],
			references: [users.id],
		}),
	}),
);

export type UserEvaluation = typeof userEvaluations.$inferSelect;
export type NewUserEvaluation = typeof userEvaluations.$inferInsert;
