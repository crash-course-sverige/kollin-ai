import { relations } from "drizzle-orm";
import {
	foreignKey,
	index,
	integer,
	pgTable,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";

import { users } from "./users.schema";

export const segments = pgTable(
	"segments",
	{
		id: uuid().primaryKey().notNull(),
		parentId: varchar("parent_id", { length: 255 }).notNull(),
		parentType: varchar("parent_type", { length: 255 }).notNull(),
		revision: integer().default(0).notNull(),
		label: varchar({ length: 255 }),
		imageUrl: varchar("image_url", { length: 255 }),
		x1: integer().notNull(),
		x2: integer().notNull(),
		y1: integer().notNull(),
		y2: integer().notNull(),
		initialWidth: integer("initial_width").notNull(),
		userId: integer("user_id").default(1).notNull(),
		createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
			.defaultNow()
			.notNull(),
	},
	(table) => {
		return [
			index("segments_parent_id_parent_type").using(
				"btree",
				table.parentId.asc().nullsLast(),
				table.parentType.asc().nullsLast(),
			),
			foreignKey({
				columns: [table.userId],
				foreignColumns: [users.id],
				name: "segments_user_id_fkey",
			}).onDelete("set default"),
		];
	},
);

export const segmentsRelations = relations(segments, ({ one }) => ({
	user: one(users, {
		fields: [segments.userId],
		references: [users.id],
	}),
}));

export type Segment = typeof segments.$inferSelect;
export type NewSegment = typeof segments.$inferInsert;
