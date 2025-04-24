import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Set up the database connection
const connectionString = process.env.DATABASE_URL || "";
const client = postgres(connectionString);

// Initialize Drizzle with the schema
export const db = drizzle(client, { schema });

// For usage in edge functions with Neon serverless
export const createEdgeClient = () => {
  const client = postgres(connectionString);
  return drizzle(client, { schema });
}; 