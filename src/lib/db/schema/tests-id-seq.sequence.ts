import { pgSequence } from "drizzle-orm/pg-core";

export const testsIdSeq = pgSequence("tests_id_seq", {
	startWith: "1",
	increment: "1",
	minValue: "1",
	maxValue: "2147483647",
	cache: "1",
	cycle: false,
});
