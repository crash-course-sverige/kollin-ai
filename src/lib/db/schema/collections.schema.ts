import {
	integer,
	jsonb,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";

export const collections = pgTable("collections", {
	id: uuid("id").primaryKey(),
	typename: text("typename").notNull(),
	collectionItemType: text("collection_item_type"),
	collectionType: text("collection_type"),
	color: text("color"),
	courseId: integer("course_id"),
	coverImageUrl: text("cover_image_url"),
	createdAt: timestamp("created_at", {
		withTimezone: true,
		mode: "string",
	}).notNull(),
	description: text("description"),
	editors: jsonb("editors").default("[]"),
	groups: jsonb("groups").default("[]"),
	icon: text("icon"),
	name: text("name").notNull(),
	updatedAt: timestamp("updated_at", {
		withTimezone: true,
		mode: "string",
	}).notNull(),
	userId: integer("user_id"),
});

export type Collection = typeof collections.$inferSelect;
export type NewCollection = typeof collections.$inferInsert;

export const collectionItems = pgTable("collection_items", {
	id: uuid("id").primaryKey(),
	typename: text("typename").notNull(),
	collectionId: uuid("collection_id").notNull(),
	createdAt: timestamp("created_at", {
		withTimezone: true,
		mode: "string",
	}).notNull(),
	editors: jsonb("editors").default("[]"),
	itemId: text("item_id").notNull(),
	itemType: text("item_type"),
	order: integer("order"),
	updatedAt: timestamp("updated_at", {
		withTimezone: true,
		mode: "string",
	}).notNull(),
	userId: integer("user_id"),
});

export type CollectionItem = typeof collectionItems.$inferSelect;
export type NewCollectionItem = typeof collectionItems.$inferInsert;
