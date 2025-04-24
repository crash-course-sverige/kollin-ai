import { sql } from "drizzle-orm";
import { integer, pgView, timestamp } from "drizzle-orm/pg-core";

export const vwUserCourses = pgView("vw_user_courses", {
	lastUsed: timestamp("last_used", { withTimezone: true, mode: "string" }),
	courseId: integer("course_id"),
	userId: integer("user_id"),
}).as(
	sql`SELECT max(exercise_evaluations.updated_at) AS last_used, courses.id AS course_id, exercise_evaluations.user_id FROM courses JOIN sources ON sources.course_id = courses.id JOIN exercises ON exercises.source_id = sources.id JOIN exercise_evaluations ON exercise_evaluations.exercise_id = exercises.id GROUP BY courses.id, exercise_evaluations.user_id UNION SELECT orders.created_at AS last_used, courses.id AS course_id, orders.user_id FROM courses JOIN orders ON orders.course_id = courses.id`,
);
