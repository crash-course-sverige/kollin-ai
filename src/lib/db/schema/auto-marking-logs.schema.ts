import { relations } from "drizzle-orm";
import {
	boolean,
	foreignKey,
	index,
	integer,
	json,
	pgTable,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";

import { courses } from "./courses.schema";

export const autoMarkingLogs = pgTable(
	"auto_marking_logs",
	{
		id: uuid().primaryKey().notNull(),
		segmentType: varchar("segment_type", { length: 255 }).notNull(),
		documentId: varchar("document_id", { length: 255 }).notNull(),
		settings: json(),
		segmentsCount: integer("segments_count").notNull(),
		segmentPattern: json("segment_pattern").notNull(),
		courseId: integer("course_id").notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
			.defaultNow()
			.notNull(),
		createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
			.defaultNow()
			.notNull(),
		verified: boolean().default(false).notNull(),
	},
	(table) => {
		return [
			index("auto_marking_logs_course_id").using(
				"btree",
				table.courseId.asc().nullsLast(),
			),
			index("auto_marking_logs_document_type_document_id").using(
				"btree",
				table.segmentType.asc().nullsLast(),
				table.documentId.asc().nullsLast(),
			),
			foreignKey({
				columns: [table.courseId],
				foreignColumns: [courses.id],
				name: "auto_marking_logs_course_id_fkey",
			}),
		];
	},
);

export const autoMarkingLogsRelations = relations(
	autoMarkingLogs,
	({ one }) => ({
		course: one(courses, {
			fields: [autoMarkingLogs.courseId],
			references: [courses.id],
		}),
	}),
);

export type AutoMarkingLog = typeof autoMarkingLogs.$inferSelect;
export type NewAutoMarkingLog = typeof autoMarkingLogs.$inferInsert;
