import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  DATABASE_URL: z.string().min(1),
  // Neo4j environment variables
  NEO4J_URI: z.string().optional().default("neo4j://localhost:7687"),
  NEO4J_USERNAME: z.string().optional().default("neo4j"),
  NEO4J_PASSWORD: z.string().optional(),
});

/**
 * Validate environment variables against the schema and export them
 */
export const env = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL,
  // Neo4j environment variables
  NEO4J_URI: process.env.NEO4J_URI,
  NEO4J_USERNAME: process.env.NEO4J_USERNAME,
  NEO4J_PASSWORD: process.env.NEO4J_PASSWORD,
}); 


