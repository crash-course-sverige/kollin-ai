import { relations } from "drizzle-orm";
import {
	boolean,
	integer,
	jsonb,
	pgEnum,
	pgTable,
	serial,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import { users } from "./users.schema";

export const studyYearEnum = pgEnum("study_year", ["1", "2", "3", "4", "5"]);

export const armadaUser = pgTable("armada_user", {
	id: integer("id")
		.primaryKey()
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	industries: integer("industries").array(),
	employments: integer("employments").array(),
	studyYear: studyYearEnum("study_year").notNull(),
	topics: text("topics").array(),
	toc: boolean("toc").notNull().default(false),
	createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
		.defaultNow()
		.notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
		.defaultNow()
		.notNull(),
});

export const armadaCompany = pgTable("armada_companies", {
	id: integer("id").primaryKey().notNull(),
	name: text("name").notNull(),
	type: text("type").notNull(),
	tier: integer("tier"),
	companyWebsite: text("company_website"),
	about: text("about"),
	purpose: text("purpose"),
	logoSquared: text("logo_squared"),
	logoFreesize: text("logo_freesize"),
	industries: jsonb("industries").$type<{ id: number; name: string }[]>(),
	values: jsonb("values").$type<string[]>(),
	employments: jsonb("employments").$type<{ id: number; name: string }[]>(),
	locations: jsonb("locations").$type<{ id: number; name: string }[]>(),
	competences: jsonb("competences").$type<string[]>(),
	cities: text("cities"),
	benefits: jsonb("benefits").$type<string[]>(),
	averageAge: integer("average_age"),
	founded: integer("founded"),
	groups: jsonb("groups").$type<{ id: number; name: string }[]>(),
	fairLocation: text("fair_location"),
	vyerPosition: text("vyer_position"),
	locationSpecial: text("location_special"),
	climateCompensation: boolean("climate_compensation"),
	flyer: text("flyer"),
	mapCoordinates: jsonb("map_coordinates").$type<[number, number][] | null>(),
	lastUpdated: timestamp("last_updated").defaultNow(),
});

export const armadaJob = pgTable("armada_jobs", {
	id: serial("id").primaryKey(),
	title: text("title"),
	location: text("location"),
	topics: text("topics").array(),
	programs: text("programs").array(),
	company: text("company"),
	companyId: integer("company_id").references(() => armadaCompany.id),
	category: text("category"),
	type: text("type"),
	description: text("description"),
	url: text("url"),
	start_date: text("start_date"),
	deadline: text("deadline"),
	yearOfStudies: text("year_of_studies"),
});

export const insertJobSchema = createInsertSchema(armadaJob, {
	title: z.string().min(1, "Titel måste fyllas i"),
	url: z.string().url("Måste vara en giltig URL"),
	company: z.number().positive("Företag krävs"),
	type: z.string().min(1, "Typ krävs"),
	topics: z.array(z.string()).min(1, "Minst ett ämne krävs"),
	programs: z.array(z.string()).min(1, "Minst ett program krävs"),
});

export const armadaFavoriteJobs = pgTable("armada_favorite_jobs", {
	userId: integer("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	jobId: integer("job_id")
		.notNull()
		.references(() => armadaJob.id, { onDelete: "cascade" }),
});

export const armadaFavoriteCompanies = pgTable("armada_favorite_companies", {
	userId: integer("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	companyId: integer("company_id")
		.notNull()
		.references(() => armadaCompany.id, { onDelete: "cascade" }),
});

// Relations

export const armadaFavoriteCompaniesRelations = relations(
	armadaFavoriteCompanies,
	({ one }) => ({
		user: one(users, {
			fields: [armadaFavoriteCompanies.userId],
			references: [users.id],
		}),
		company: one(armadaCompany, {
			fields: [armadaFavoriteCompanies.companyId],
			references: [armadaCompany.id],
		}),
	}),
);

export const armadaFavoriteJobsRelations = relations(
	armadaFavoriteJobs,
	({ one }) => ({
		user: one(users, {
			fields: [armadaFavoriteJobs.userId],
			references: [users.id],
		}),
		job: one(armadaJob, {
			fields: [armadaFavoriteJobs.jobId],
			references: [armadaJob.id],
		}),
	}),
);

export const armadaCompanyRelations = relations(armadaCompany, ({ many }) => ({
	jobs: many(armadaJob),
	favoriteUsers: many(armadaFavoriteCompanies),
}));

export const armadaJobRelations = relations(armadaJob, ({ one, many }) => ({
	company: one(armadaCompany, {
		fields: [armadaJob.companyId],
		references: [armadaCompany.id],
	}),
	favoriteUsers: many(armadaFavoriteJobs),
}));

export const armadaUserRelations = relations(armadaUser, ({ one }) => ({
	user: one(users, {
		fields: [armadaUser.id],
		references: [users.id],
	}),
}));

export const userArmadaRelations = relations(users, ({ many }) => ({
	favoriteJobs: many(armadaFavoriteJobs),
	favoriteCompanies: many(armadaFavoriteCompanies),
}));

export type ArmadaUser = typeof armadaUser.$inferSelect;
export type NewArmadaUser = typeof armadaUser.$inferInsert;

export type ArmadaCompany = typeof armadaCompany.$inferSelect;
export type NewArmadaCompany = typeof armadaCompany.$inferInsert;

export type ArmadaJob = typeof armadaJob.$inferSelect;
export type NewArmadaJob = z.infer<typeof insertJobSchema>;
