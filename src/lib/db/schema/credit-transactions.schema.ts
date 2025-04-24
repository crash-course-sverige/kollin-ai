import { relations } from "drizzle-orm";
import {
	foreignKey,
	index,
	integer,
	pgTable,
	text,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";

import { users } from "./users.schema";

export const creditTransactions = pgTable(
	"credit_transactions",
	{
		id: uuid().primaryKey().notNull(),
		amount: integer().notNull(),
		description: text(),
		relatedObjectId: varchar("related_object_id", { length: 255 }),
		relatedObjectType: varchar("related_object_type", { length: 255 }),
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
			index("credit_transactions_related_object_id_related_object_type").using(
				"btree",
				table.relatedObjectId.asc().nullsLast(),
				table.relatedObjectType.asc().nullsLast(),
			),
			index("credit_transactions_user_id").using(
				"btree",
				table.userId.asc().nullsLast(),
			),
			foreignKey({
				columns: [table.userId],
				foreignColumns: [users.id],
				name: "credit_transactions_user_id_fkey",
			}).onDelete("cascade"),
		];
	},
);

export const creditTransactionsRelations = relations(
	creditTransactions,
	({ one }) => ({
		user: one(users, {
			fields: [creditTransactions.userId],
			references: [users.id],
		}),
	}),
);

export type CreditTransaction = typeof creditTransactions.$inferSelect;
export type NewCreditTransaction = typeof creditTransactions.$inferInsert;
