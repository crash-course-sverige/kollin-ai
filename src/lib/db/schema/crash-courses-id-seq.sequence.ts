import { pgSequence } from "drizzle-orm/pg-core";

export const crashCoursesIdSeq = pgSequence("crash_courses_id_seq", {
	startWith: "1",
	increment: "1",
	minValue: "1",
	maxValue: "2147483647",
	cache: "1",
	cycle: false,
});
