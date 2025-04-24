import { relations } from "drizzle-orm";
import {
	foreignKey,
	integer,
	pgTable,
	timestamp,
	unique,
	uuid,
} from "drizzle-orm/pg-core";

import { achievements } from "./achievements.schema";
import { users } from "./users.schema";

export const userAchievements = pgTable(
	"user_achievements",
	{
		id: uuid().primaryKey().notNull(),
		achievementId: uuid("achievement_id").notNull(),
		userId: integer("user_id").notNull(),
		createdAt: timestamp("created_at", {
			withTimezone: true,
			mode: "string",
		}).notNull(),
		updatedAt: timestamp("updated_at", {
			withTimezone: true,
			mode: "string",
		}).notNull(),
	},
	(table) => [
		foreignKey({
			columns: [table.achievementId],
			foreignColumns: [achievements.id],
			name: "user_achievements_achievement_id_fkey",
		}),
		foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_achievements_user_id_fkey",
		}),
		unique("user_achievements_user_id_achievement_id_uk").on(
			table.achievementId,
			table.userId,
		),
	],
);

export const userAchievementsRelations = relations(
	userAchievements,
	({ one }) => ({
		achievement: one(achievements, {
			fields: [userAchievements.achievementId],
			references: [achievements.id],
		}),
		user: one(users, {
			fields: [userAchievements.userId],
			references: [users.id],
		}),
	}),
);

export type UserAchievement = typeof userAchievements.$inferSelect;
export type NewUserAchievement = typeof userAchievements.$inferInsert;
