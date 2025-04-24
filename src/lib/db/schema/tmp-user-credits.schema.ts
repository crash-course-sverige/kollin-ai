import { pgTable, varchar } from "drizzle-orm/pg-core";

export const tmpUserCredits = pgTable("tmp_user_credits", {
	email: varchar({ length: 250 }),
});

export type TmpUserCredits = typeof tmpUserCredits.$inferSelect;
export type NewTmpUserCredits = typeof tmpUserCredits.$inferInsert;
