import { pgTable, text, timestamp, uuid, varchar, primaryKey, integer, foreignKey, boolean, serial, index, vector, doublePrecision, unique } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  password: text("password"),
  role: varchar("role", { length: 20 }).notNull().default("user"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  flashcardProgress: many(flashcardProgress),
}));

export const sessions = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

// Flashcard progress table to track user progress on each flashcard
export const flashcardProgress = pgTable("flashcard_progress", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  flashcardId: integer("flashcard_id").notNull(),
  setId: text("set_id").notNull(), // Identifier for the flashcard set (e.g., "calculus")
  difficulty: varchar("difficulty", { length: 10 }).notNull(), // 'easy', 'medium', 'hard'
  lastReviewed: timestamp("last_reviewed").defaultNow().notNull(),
  nextReviewDate: timestamp("next_review_date"), // For spaced repetition in the future
  reviewCount: integer("review_count").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const flashcardProgressRelations = relations(flashcardProgress, ({ one }) => ({
  user: one(users, {
    fields: [flashcardProgress.userId],
    references: [users.id],
  }),
}));

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({
      columns: [vt.identifier, vt.token],
    }),
  })
);

export const chapters = pgTable(
	"chapters",
	{
		id: serial().notNull(),
		chapterType: varchar("chapter_type", { length: 255 }).notNull(),
		name: varchar({ length: 255 }),
		title: varchar({ length: 255 }),
		markdown: text(),
		html: text(),
		raw_content: text(),
		creator: integer().default(1),
		locked: boolean().default(false),
		createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
			.defaultNow()
			.notNull(),
		published: boolean().default(false),
		courseId: integer("course_id"),
		embedding: vector("embedding", { dimensions: 1536 }),
	},
	(table) => {
		return [
			index("chapters_embedding_idx").using(
				"hnsw",
				table.embedding.asc().nullsLast().op("vector_cosine_ops"),
			),
			index("idx_chapter_type").using(
				"btree",
				table.chapterType.asc().nullsLast(),
			),
			foreignKey({
				columns: [table.courseId],
				foreignColumns: [courses.id],
				name: "chapters_course_id_fkey",
			}),
			foreignKey({
				columns: [table.creator],
				foreignColumns: [users.id],
				name: "chapters_creator_fkey",
			}).onDelete("set default"),
			primaryKey({
				columns: [table.id, table.chapterType],
				name: "chapters_pkey",
			}),
		];
	},
);

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

export const schools = pgTable(
	"schools",
	{
		id: serial().primaryKey().notNull(),
		name: varchar({ length: 255 }),
		nickname: varchar({ length: 255 }),
		createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
			.defaultNow()
			.notNull(),
	},
	(table) => {
		return [unique("schools_name_key").on(table.name)];
	},
);

export const subjects = pgTable("subjects", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 255 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
		.defaultNow()
		.notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
		.defaultNow()
		.notNull(),
});

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;

export type FlashcardProgress = typeof flashcardProgress.$inferSelect;
export type NewFlashcardProgress = typeof flashcardProgress.$inferInsert;

export type VerificationToken = typeof verificationTokens.$inferSelect;
export type NewVerificationToken = typeof verificationTokens.$inferInsert; 

export type Chapter = typeof chapters.$inferSelect;
export type NewChapter = typeof chapters.$inferInsert;
