import { relations } from "drizzle-orm";
import {
	foreignKey,
	integer,
	pgTable,
	primaryKey,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";

import { chapters } from "./chapters.schema";
import { tags } from "./tags.schema";

export const tagContent = pgTable(
	"tag_content",
	{
		chapterId: integer("chapter_id").notNull(),
		chapterType: varchar("chapter_type", { length: 255 }).notNull(),
		tagId: integer("tag_id").notNull(),
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
				columns: [table.chapterId, table.chapterType],
				foreignColumns: [chapters.id, chapters.chapterType],
				name: "category_content_chapters_fkey",
			})
				.onUpdate("cascade")
				.onDelete("cascade"),
			foreignKey({
				columns: [table.tagId],
				foreignColumns: [tags.id],
				name: "category_content_tag_id_fkey",
			}),
			primaryKey({
				columns: [table.chapterId, table.chapterType, table.tagId],
				name: "category_content_pkey",
			}),
		];
	},
);

export const tagContentRelations = relations(tagContent, ({ one }) => ({
	chapter: one(chapters, {
		fields: [tagContent.chapterId],
		references: [chapters.id],
	}),
	tag: one(tags, {
		fields: [tagContent.tagId],
		references: [tags.id],
	}),
}));

export type TagContent = typeof tagContent.$inferSelect;
export type NewTagContent = typeof tagContent.$inferInsert;
