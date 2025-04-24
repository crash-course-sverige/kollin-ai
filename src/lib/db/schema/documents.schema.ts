import { relations } from "drizzle-orm";
import {
	boolean,
	integer,
	jsonb,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";

import { sources } from "./sources.schema";

export type DocumentMetadata = {
	date?: Date | string;
	author?: string;
	variant?: string;
	edition?: string;
	title?: string;
};

export type DocumentGroup = {
	schoolId?: number;
	groupId?: string;
};

export const documents = pgTable("documents", {
	id: uuid("id").primaryKey(),
	typename: text("typename").notNull(),
	courseId: integer("course_id"),
	format: text("format"),
	groups: jsonb("groups").$type<DocumentGroup>(),
	hash: text("hash").notNull(),
	metadata: jsonb("metadata").$type<DocumentMetadata>(),
	name: text("name"),
	size: integer("size"),
	subType: text("sub_type"),
	type: text("type"),
	url: text("url"),
	userId: integer("user_id"),
	validated: boolean("validated"),
	confidence: integer("confidence"),
	sourceId: integer("source_id").references(() => sources.id),
	createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
		.defaultNow()
		.notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
		.defaultNow()
		.notNull(),
});

export const documentsRelations = relations(documents, ({ one }) => ({
	source: one(sources, {
		fields: [documents.sourceId],
		references: [sources.id],
	}),
}));

export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;
