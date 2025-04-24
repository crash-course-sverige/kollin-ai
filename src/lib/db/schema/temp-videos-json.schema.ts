import { pgTable, text } from "drizzle-orm/pg-core";

export const tempVideosJson = pgTable("temp_videos_json", {
	values: text(),
});

export type TempVideoJson = typeof tempVideosJson.$inferSelect;
export type NewTempVideoJson = typeof tempVideosJson.$inferInsert;
