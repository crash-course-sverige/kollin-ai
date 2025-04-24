import { relations } from "drizzle-orm";
import {
	boolean,
	foreignKey,
	integer,
	pgTable,
	serial,
	text,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";

import { commentsAncestors } from "./comments-ancestors.schema";
import { threads } from "./threads.schema";
import { users } from "./users.schema";

export const comments = pgTable(
	"comments",
	{
		id: serial().primaryKey().notNull(),
		markdown: text(),
		html: text().notNull(),
		votes: integer().default(0),
		accepted: boolean().default(false),
		hierarchyLevel: integer("hierarchy_level"),
		userId: integer("user_id").default(1),
		threadId: integer("thread_id"),
		parentId: integer("parent_id"),
		createdAt: timestamp("created_at", {
			withTimezone: true,
			mode: "string",
		}).notNull(),
		updatedAt: timestamp("updated_at", {
			withTimezone: true,
			mode: "string",
		}).notNull(),
		anonymous: boolean().default(false).notNull(),
		username: varchar({ length: 255 }),
	},
	(table) => {
		return [
			foreignKey({
				columns: [table.parentId],
				foreignColumns: [table.id],
				name: "comments_parent_id_fkey",
			})
				.onUpdate("cascade")
				.onDelete("cascade"),
			foreignKey({
				columns: [table.threadId],
				foreignColumns: [threads.id],
				name: "comments_thread_id_fkey",
			})
				.onUpdate("cascade")
				.onDelete("cascade"),
			foreignKey({
				columns: [table.userId],
				foreignColumns: [users.id],
				name: "comments_user_id_fkey",
			}).onDelete("set default"),
		];
	},
);
export const commentsRelations = relations(comments, ({ one, many }) => ({
	comment: one(comments, {
		fields: [comments.parentId],
		references: [comments.id],
		relationName: "comments_parentId_comments_id",
	}),
	comments: many(comments, {
		relationName: "comments_parentId_comments_id",
	}),
	thread: one(threads, {
		fields: [comments.threadId],
		references: [threads.id],
	}),
	user: one(users, {
		fields: [comments.userId],
		references: [users.id],
	}),
	commentsAncestors_ancestorId: many(commentsAncestors, {
		relationName: "commentsAncestors_ancestorId_comments_id",
	}),
	commentsAncestors_commentId: many(commentsAncestors, {
		relationName: "commentsAncestors_commentId_comments_id",
	}),
}));

export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;
