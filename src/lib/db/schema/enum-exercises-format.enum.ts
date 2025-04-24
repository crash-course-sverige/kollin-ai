import { pgEnum } from "drizzle-orm/pg-core";

export const enumExercisesFormat = pgEnum("enum_exercises_format", [
	"TEXT",
	"IMAGE",
]);
