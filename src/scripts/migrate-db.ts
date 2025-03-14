import { db } from "@/lib/db";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/lib/db/schema";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL not found");
}

// For migrations
const migrationClient = postgres(process.env.DATABASE_URL, { max: 1 });
const migrationDb = drizzle(migrationClient);

async function main() {
  try {
    console.log("⏳ Running migrations...");
    
    // This will run migrations on the database, creating tables if they don't exist
    // and making any other necessary changes to match your schema
    await migrate(migrationDb, { migrationsFolder: "drizzle" });
    
    console.log("✅ Migrations completed successfully!");
    
    // Validate the newly created tables by querying them
    console.log("⏳ Validating database tables...");
    try {
      // List tables to verify
      const pgTables = await migrationClient`
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        ORDER BY tablename;
      `;
      console.log("📋 Available tables:", pgTables.map(t => t.tablename).join(", "));
      
      // Check if our flashcard_progress table is present
      const hasFlashcardProgressTable = pgTables.some(t => t.tablename === 'flashcard_progress');
      if (hasFlashcardProgressTable) {
        console.log("✅ Flashcard progress table is properly created!");
      } else {
        console.error("❌ Flashcard progress table wasn't created properly.");
      }
    } catch (error) {
      console.error("❌ Failed to validate tables:", error);
    }
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await migrationClient.end();
    process.exit(0);
  }
}

main(); 