import { relations } from "drizzle-orm";
import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

import { userAchievements } from "./user-achievements.schema";

export const achievements = pgTable("achievements", {
	id: uuid().primaryKey().notNull(),
	name: varchar({ length: 255 }),
	description: varchar({ length: 255 }),
	imageUrl: varchar("image_url", { length: 255 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
		.defaultNow()
		.notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
		.defaultNow()
		.notNull(),
	color: varchar({ length: 255 }),
});

export const achievementsRelations = relations(achievements, ({ many }) => ({
	userAchievements: many(userAchievements),
}));

export type Achievement = typeof achievements.$inferSelect;
export type NewAchievement = typeof achievements.$inferInsert;
