import { relations } from "drizzle-orm";
import {
	foreignKey,
	integer,
	pgTable,
	serial,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";

import { users } from "./users.schema";

export const pendingTransactions = pgTable(
	"pending_transactions",
	{
		id: serial().primaryKey().notNull(),
		userId: integer("user_id").notNull(),
		paymentId: varchar("payment_id", { length: 255 }),
		credits: integer().notNull(),
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
			foreignKey({
				columns: [table.userId],
				foreignColumns: [users.id],
				name: "pending_transactions_user_id_fkey",
			}),
		];
	},
);

export const pendingTransactionsRelations = relations(
	pendingTransactions,
	({ one }) => ({
		user: one(users, {
			fields: [pendingTransactions.userId],
			references: [users.id],
		}),
	}),
);

export type PendingTransaction = typeof pendingTransactions.$inferSelect;
export type NewPendingTransaction = typeof pendingTransactions.$inferInsert;
