import { pgEnum } from "drizzle-orm/pg-core";

export const enumSolutionsFormat = pgEnum("enum_solutions_format", [
	"TEXT",
	"IMAGE",
]);
