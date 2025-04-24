import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const objectFlags = pgTable("object_flags", {
	id: uuid("id").primaryKey(),
	typename: text("typename").notNull(),
	createdAt: timestamp("created_at", {
		withTimezone: true,
		mode: "string",
	}).notNull(),
	description: text("description"),
	objectId: text("object_id").notNull(),
	objectType: text("object_type").notNull(),
	reason: text("reason").notNull(),
	updatedAt: timestamp("updated_at", {
		withTimezone: true,
		mode: "string",
	}).notNull(),
	userId: integer("user_id").notNull(),
});
