import {
	pgTable,
	serial,
	timestamp,
	unique,
	varchar,
} from "drizzle-orm/pg-core";

export const schoolEmails = pgTable(
	"school_emails",
	{
		id: serial().primaryKey().notNull(),
		domain: varchar({ length: 255 }).notNull(),
		createdAt: timestamp("created_at", {
			withTimezone: true,
			mode: "string",
		}).notNull(),
		updatedAt: timestamp("updated_at", {
			withTimezone: true,
			mode: "string",
		}).notNull(),
	},
	(table) => {
		return [unique("school_emails_domain_key").on(table.domain)];
	},
);

export type SchoolEmail = typeof schoolEmails.$inferSelect;
export type NewSchoolEmail = typeof schoolEmails.$inferInsert;
