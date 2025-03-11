import { pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

/**
 * Schema for user assessments of knowledge graph concepts
 * Stores user interactions with concepts from the Neo4j knowledge graph
 */
export const userAssessments = pgTable("user_assessments", {
  id: text("id").primaryKey().notNull(),  // UUID for the assessment
  userId: varchar("user_id", { length: 255 }).notNull(),  // User ID
  nodeId: varchar("node_id", { length: 255 }).notNull(),  // Concept ID from Neo4j
  assessment: varchar("assessment", { length: 50 }).notNull(),  // "understood" or "not_understood"
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Types for the user assessment
export type UserAssessment = typeof userAssessments.$inferSelect;
export type NewUserAssessment = typeof userAssessments.$inferInsert;

// Zod validation schemas
export const insertUserAssessmentSchema = createInsertSchema(userAssessments);
export const selectUserAssessmentSchema = createSelectSchema(userAssessments);

// Zod schema for assessment creation from API request
export const createUserAssessmentSchema = z.object({
  user_id: z.string().min(1),
  node_id: z.string().min(1),
  assessment: z.enum(["understood", "not_understood"]),
});

export type CreateUserAssessmentInput = z.infer<typeof createUserAssessmentSchema>; 