import { relations } from "drizzle-orm";
import {
	foreignKey,
	integer,
	jsonb,
	pgTable,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";

import { users } from "./users.schema";

export const userDevices = pgTable(
	"user_devices",
	{
		id: uuid().primaryKey().notNull(),
		fingerprintHash: varchar("fingerprint_hash", { length: 255 }).notNull(),
		deviceInfo: jsonb("device_info").notNull(),
		deviceType: varchar("device_type", { length: 255 }).notNull(),
		lastLoggedIn: timestamp("last_logged_in", {
			withTimezone: true,
			mode: "string",
		})
			.defaultNow()
			.notNull(),
		lastLogInIp: varchar("last_log_in_ip", { length: 255 }).notNull(),
		userId: integer("user_id"),
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
				columns: [table.userId],
				foreignColumns: [users.id],
				name: "user_devices_user_id_fkey",
			}).onDelete("cascade"),
		];
	},
);

export const userDevicesRelations = relations(userDevices, ({ one }) => ({
	user: one(users, {
		fields: [userDevices.userId],
		references: [users.id],
	}),
}));

export type UserDevice = typeof userDevices.$inferSelect;
export type NewUserDevice = typeof userDevices.$inferInsert;
