import { relations } from "drizzle-orm";
import {
	boolean,
	foreignKey,
	index,
	integer,
	pgTable,
	primaryKey,
	serial,
	text,
	timestamp,
	varchar,
	vector,
} from "drizzle-orm/pg-core";

import { courses } from "./courses.schema";
import { tagContent } from "./tag-content.schema";
import { users } from "./users.schema";

export const chapters = pgTable(
	"chapters",
	{
		id: serial().notNull(),
		chapterType: varchar("chapter_type", { length: 255 }).notNull(),
		name: varchar({ length: 255 }),
		title: varchar({ length: 255 }),
		markdown: text(),
		html: text(),
		raw_content: text(),
		creator: integer().default(1),
		locked: boolean().default(false),
		createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
			.defaultNow()
			.notNull(),
		published: boolean().default(false),
		courseId: integer("course_id"),
		embedding: vector("embedding", { dimensions: 1536 }),
	},
	(table) => {
		return [
			index("chapters_embedding_idx").using(
				"hnsw",
				table.embedding.asc().nullsLast().op("vector_cosine_ops"),
			),
			index("idx_chapter_type").using(
				"btree",
				table.chapterType.asc().nullsLast(),
			),
			foreignKey({
				columns: [table.courseId],
				foreignColumns: [courses.id],
				name: "chapters_course_id_fkey",
			}),
			foreignKey({
				columns: [table.creator],
				foreignColumns: [users.id],
				name: "chapters_creator_fkey",
			}).onDelete("set default"),
			primaryKey({
				columns: [table.id, table.chapterType],
				name: "chapters_pkey",
			}),
		];
	},
);

export const chaptersRelations = relations(chapters, ({ one, many }) => ({
	tagContents: many(tagContent),
	course: one(courses, {
		fields: [chapters.courseId],
		references: [courses.id],
	}),
	user: one(users, {
		fields: [chapters.creator],
		references: [users.id],
	}),
}));

export type Chapter = typeof chapters.$inferSelect;
export type NewChapter = typeof chapters.$inferInsert;
