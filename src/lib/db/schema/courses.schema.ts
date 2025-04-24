import { relations } from "drizzle-orm";
import {
	boolean,
	doublePrecision,
	foreignKey,
	integer,
	pgTable,
	serial,
	text,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";

import { autoMarkingLogs } from "./auto-marking-logs.schema";
import { bookmarks } from "./bookmarks.schema";
import { chapters } from "./chapters.schema";
import { chatPromptSuggestions } from "./chats.schema";
import { clusterGroups } from "./cluster-groups.schema";
import { coupons } from "./coupons.schema";
import { courseMetadata } from "./course-metadata.schema";
import { coursePrerequisites } from "./course-prerequisites.schema";
import { courseReviews } from "./course-reviews.schema";
import { messages } from "./messages.schema";
import { modules } from "./modules.schema";
import { orders } from "./orders.schema";
import { programCourses } from "./program-courses.schema";
import { resources } from "./resources.schema";
import { schools } from "./schools.schema";
import { sources } from "./sources.schema";
import { stripeSessions } from "./stripe-sessions.schema";
import { studyPlans } from "./study-plans.schema";
import { subjects } from "./subjects.schema";
import { swishPayments } from "./swish-payments.schema";
import { tagLocations } from "./tag-locations.schema";
import { userCourses } from "./user-courses.schema";

export const courses = pgTable(
	"courses",
	{
		id: serial().primaryKey().notNull(),
		name: varchar({ length: 255 }),
		icon: varchar({ length: 255 }),
		code: varchar({ length: 255 }),
		color: varchar({ length: 255 }),
		description: text(),
		published: boolean(),
		publicTagging: boolean("public_tagging"),
		price: integer(),
		subjectId: integer("subject_id"),
		schoolId: integer("school_id").default(1),
		createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
			.defaultNow()
			.notNull(),
		lang: varchar({ length: 255 }).default("sv"),
		visits: integer().default(0),
		credits: doublePrecision(),
	},
	(table) => {
		return [
			foreignKey({
				columns: [table.schoolId],
				foreignColumns: [schools.id],
				name: "courses_school_id_fkey",
			}),
			foreignKey({
				columns: [table.subjectId],
				foreignColumns: [subjects.id],
				name: "courses_subject_id_fkey",
			}),
		];
	},
);

export const coursesRelations = relations(courses, ({ one, many }) => ({
	courseReviews: many(courseReviews),
	programCourses: many(programCourses),
	userCourses: many(userCourses),
	swishPayments: many(swishPayments),
	stripeSessions: many(stripeSessions),
	sources: many(sources),
	coupons: many(coupons),
	modules: many(modules),
	courseMetadata: many(courseMetadata),
	autoMarkingLogs: many(autoMarkingLogs),
	coursePrerequisites_courseId: many(coursePrerequisites, {
		relationName: "coursePrerequisites_courseId_courses_id",
	}),
	coursePrerequisites_prerequisiteCourseId: many(coursePrerequisites, {
		relationName: "coursePrerequisites_prerequisiteCourseId_courses_id",
	}),
	school: one(schools, {
		fields: [courses.schoolId],
		references: [schools.id],
	}),
	subject: one(subjects, {
		fields: [courses.subjectId],
		references: [subjects.id],
	}),
	orders: many(orders),
	resources: many(resources),
	studyPlans: many(studyPlans),
	tagLocations: many(tagLocations),
	messages: many(messages),
	bookmarks: many(bookmarks),
	clusterGroups: many(clusterGroups),
	chapters: many(chapters),
	promptSuggestions: many(chatPromptSuggestions),
}));

export type Course = typeof courses.$inferSelect;
export type NewCourse = typeof courses.$inferInsert;
