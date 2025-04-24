import { relations } from "drizzle-orm";
import { foreignKey, integer, pgTable } from "drizzle-orm/pg-core";

import { comments } from "./comments.schema";

export const commentsAncestors = pgTable(
	"comments_ancestors",
	{
		commentId: integer("comment_id").notNull(),
		ancestorId: integer("ancestor_id").notNull(),
	},
	(table) => {
		return [
			foreignKey({
				columns: [table.ancestorId],
				foreignColumns: [comments.id],
				name: "comments_ancestors_ancestor_id_fkey",
			})
				.onUpdate("cascade")
				.onDelete("cascade"),
			foreignKey({
				columns: [table.commentId],
				foreignColumns: [comments.id],
				name: "comments_ancestors_comment_id_fkey",
			})
				.onUpdate("cascade")
				.onDelete("cascade"),
		];
	},
);

export const commentsAncestorsRelations = relations(
	commentsAncestors,
	({ one }) => ({
		comment_ancestorId: one(comments, {
			fields: [commentsAncestors.ancestorId],
			references: [comments.id],
			relationName: "commentsAncestors_ancestorId_comments_id",
		}),
		comment_commentId: one(comments, {
			fields: [commentsAncestors.commentId],
			references: [comments.id],
			relationName: "commentsAncestors_commentId_comments_id",
		}),
	}),
);

export type CommentsAncestor = typeof commentsAncestors.$inferSelect;
export type NewCommentsAncestor = typeof commentsAncestors.$inferInsert;
