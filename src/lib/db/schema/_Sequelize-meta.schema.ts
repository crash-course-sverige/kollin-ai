/**
 * !!!
 *
 * INVESTIGATE WHY WE THERE IS TWO SEQUELIZE META...
 *
 * !!!
 */

import { pgTable, varchar } from "drizzle-orm/pg-core";

export const sequelize_meta = pgTable("sequelize_meta", {
	name: varchar({ length: 255 }).primaryKey().notNull(),
});
