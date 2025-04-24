import {
	integer,
	jsonb,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";

export const userProgress = pgTable("user_progress", {
	id: uuid("id").primaryKey(),
	typename: text("typename").notNull(),
	createdAt: timestamp("created_at", {
		withTimezone: true,
		mode: "string",
	}).notNull(),
	data: jsonb("data").notNull(),
	objectId: text("object_id").notNull(),
	objectType: text("object_type").notNull(),
	objectTypeId: text("object_type_id").notNull(),
	updatedAt: timestamp("updated_at", {
		withTimezone: true,
		mode: "string",
	}).notNull(),
	userId: integer("user_id").notNull(),
});
