import { sql } from "drizzle-orm";
import { integer, pgView, text, varchar } from "drizzle-orm/pg-core";

export const purchases = pgView("purchases", {
	paid: integer(),
	price: integer(),
	course: varchar({ length: 255 }),
	email: varchar({ length: 255 }),
	name: text(),
	time: text(),
	referrer: varchar({ length: 255 }),
}).as(
	sql`SELECT orders.amount_cents AS paid, courses.price, courses.name AS course, buyer.email, concat(buyer.first_name, ' ', buyer.last_name) AS name, to_char(orders.created_at, 'DD Mon HH24:MI'::text) AS "time", referee.email AS referrer FROM orders JOIN users buyer ON orders.user_id = buyer.id JOIN courses ON orders.course_id = courses.id LEFT JOIN referrals ON orders.user_id = referrals.receiver_id LEFT JOIN users referee ON referrals.sender_id = buyer.id WHERE orders.amount_cents <> 0 AND courses.price <> 0 ORDER BY orders.created_at DESC`,
);
