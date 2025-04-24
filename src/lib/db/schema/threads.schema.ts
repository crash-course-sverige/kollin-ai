import { relations } from "drizzle-orm";
import {
	boolean,
	foreignKey,
	integer,
	pgTable,
	serial,
	timestamp,
} from "drizzle-orm/pg-core";

import { comments } from "./comments.schema";
import { exercises } from "./exercises.schema";
import { threadFollowers } from "./thread-followers.schema";
import { users } from "./users.schema";

export const threads = pgTable(
	"threads",
	{
		id: serial().primaryKey().notNull(),
		solved: boolean().default(false),
		userId: integer("user_id").default(1),
		exerciseId: integer("exercise_id"),
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
				name: "threads_user_id_fkey",
			}).onDelete("set default"),
			foreignKey({
				columns: [table.exerciseId],
				foreignColumns: [exercises.id],
				name: "threads_exercise_id_fkey",
			}).onDelete("cascade"),
		];
	},
);

export const threadsRelations = relations(threads, ({ one, many }) => ({
	threadFollowers: many(threadFollowers),
	user: one(users, {
		fields: [threads.userId],
		references: [users.id],
	}),
	exercise: one(exercises, {
		fields: [threads.exerciseId],
		references: [exercises.id],
	}),
	comments: many(comments),
}));

export type Thread = typeof threads.$inferSelect;
export type NewThread = typeof threads.$inferInsert;
