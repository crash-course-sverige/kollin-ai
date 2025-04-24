import { sql } from "drizzle-orm";
import { bigint, pgView, varchar } from "drizzle-orm/pg-core";

export const userTestsWithName = pgView("user_tests_with_name", {
	firstName: varchar("first_name", { length: 255 }),
	lastName: varchar("last_name", { length: 255 }),
	email: varchar({ length: 255 }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	count: bigint({ mode: "number" }),
}).as(
	sql`SELECT users.first_name, users.last_name, users.email, a.count FROM users JOIN ( SELECT user_tests.user_id, count(*) AS count FROM user_tests GROUP BY user_tests.user_id) a ON a.user_id = users.id WHERE users.admin <> true ORDER BY a.count DESC`,
);
