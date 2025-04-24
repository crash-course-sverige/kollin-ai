import { relations } from "drizzle-orm";
import {
	foreignKey,
	integer,
	pgTable,
	serial,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";

import { autoTagVotes } from "./auto-tag-votes.schema";
import { exerciseLocations } from "./exercise-locations.schema";
import { tagContent } from "./tag-content.schema";
import { tagLocations } from "./tag-locations.schema";
import { tagVotes } from "./tag-votes.schema";
import { theoryBookings } from "./theory-bookings.schema";
import { users } from "./users.schema";

export const tags = pgTable(
	"tags",
	{
		id: serial().primaryKey().notNull(),
		name: varchar({ length: 255 }).notNull(),
		userId: integer("user_id").default(1).notNull(),
		createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
		updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
	},
	(table) => {
		return [
			foreignKey({
				columns: [table.userId],
				foreignColumns: [users.id],
				name: "tags_user_id_fkey",
			}),
		];
	},
);

export const tagsRelations = relations(tags, ({ one, many }) => ({
	user: one(users, {
		fields: [tags.userId],
		references: [users.id],
	}),
	theoryBookings: many(theoryBookings),
	tagLocations: many(tagLocations),
	autoTagVotes: many(autoTagVotes),
	exerciseLocations: many(exerciseLocations),
	tagVotes: many(tagVotes),
	tagContents: many(tagContent),
}));

export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;
