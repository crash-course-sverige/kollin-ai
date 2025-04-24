import { relations } from "drizzle-orm";
import {
	foreignKey,
	integer,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";

import { liveSessions } from "./live-sessions.schema";
import { users } from "./users.schema";

export const liveSessionAttendees = pgTable(
	"live_session_attendees",
	{
		id: uuid().primaryKey().notNull(),
		question: text(),
		userId: integer("user_id").notNull(),
		liveSessionId: uuid("live_session_id").notNull(),
		emailNotificationSent: integer("email_notification_sent"),
		smsNotificationSent: integer("sms_notification_sent"),
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
				columns: [table.liveSessionId],
				foreignColumns: [liveSessions.id],
				name: "live_session_attendees_live_session_id_fkey",
			}),
			foreignKey({
				columns: [table.userId],
				foreignColumns: [users.id],
				name: "live_session_attendees_user_id_fkey",
			}),
		];
	},
);

export const liveSessionAttendeesRelations = relations(
	liveSessionAttendees,
	({ one }) => ({
		liveSession: one(liveSessions, {
			fields: [liveSessionAttendees.liveSessionId],
			references: [liveSessions.id],
		}),
		user: one(users, {
			fields: [liveSessionAttendees.userId],
			references: [users.id],
		}),
	}),
);

export type LiveSessionAttendee = typeof liveSessionAttendees.$inferSelect;
export type NewLiveSessionAttendee = typeof liveSessionAttendees.$inferInsert;
