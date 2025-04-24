import { relations } from "drizzle-orm";
import {
	boolean,
	foreignKey,
	integer,
	pgTable,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";

import { liveSessionAttendees } from "./live-session-attendees.schema";
import { users } from "./users.schema";

export const liveSessions = pgTable(
	"live_sessions",
	{
		id: uuid().primaryKey().notNull(),
		startTime: timestamp("start_time", {
			withTimezone: true,
			mode: "string",
		}).notNull(),
		endTime: timestamp("end_time", {
			withTimezone: true,
			mode: "string",
		}).notNull(),
		name: varchar({ length: 255 }).notNull(),
		streamLink: varchar("stream_link", { length: 255 }),
		level: integer(),
		published: boolean().default(false).notNull(),
		userId: integer("user_id").notNull(),
		courseIds: integer("course_ids").array().notNull(),
		createdAt: timestamp("created_at", {
			withTimezone: true,
			mode: "string",
		}).notNull(),
		updatedAt: timestamp("updated_at", {
			withTimezone: true,
			mode: "string",
		}).notNull(),
	},
	(table) => {
		return [
			foreignKey({
				columns: [table.userId],
				foreignColumns: [users.id],
				name: "live_sessions_user_id_fkey",
			}),
		];
	},
);

export const liveSessionsRelations = relations(
	liveSessions,
	({ one, many }) => ({
		user: one(users, {
			fields: [liveSessions.userId],
			references: [users.id],
		}),
		liveSessionAttendees: many(liveSessionAttendees),
	}),
);

export type LiveSession = typeof liveSessions.$inferSelect;
export type NewLiveSession = typeof liveSessions.$inferInsert;
