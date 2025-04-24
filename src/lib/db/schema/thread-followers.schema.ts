import { relations } from "drizzle-orm";
import {
	foreignKey,
	integer,
	pgTable,
	serial,
	timestamp,
} from "drizzle-orm/pg-core";

import { threads } from "./threads.schema";
import { users } from "./users.schema";

export const threadFollowers = pgTable(
	"thread_followers",
	{
		id: serial().primaryKey().notNull(),
		notifications: integer(),
		userId: integer("user_id").notNull(),
		threadId: integer("thread_id").notNull(),
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
				columns: [table.threadId],
				foreignColumns: [threads.id],
				name: "thread_followers_thread_id_fkey",
			}).onDelete("cascade"),
			foreignKey({
				columns: [table.userId],
				foreignColumns: [users.id],
				name: "thread_followers_user_id_fkey",
			}).onDelete("cascade"),
		];
	},
);

export const threadFollowersRelations = relations(
	threadFollowers,
	({ one }) => ({
		thread: one(threads, {
			fields: [threadFollowers.threadId],
			references: [threads.id],
		}),
		user: one(users, {
			fields: [threadFollowers.userId],
			references: [users.id],
		}),
	}),
);

export type ThreadFollower = typeof threadFollowers.$inferSelect;
export type NewThreadFollower = typeof threadFollowers.$inferInsert;
