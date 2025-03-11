import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

// Get current file directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: resolve(__dirname, '.env.local') });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL environment variable is required");
  process.exit(1);
}

async function runMigration() {
  try {
    console.log("🔄 Starting database migration...");
    console.log(`📊 Using database: ${connectionString}`);
    
    // Create the DB connection
    const sql = postgres(connectionString, { max: 1 });
    
    // Initialize Drizzle
    const db = drizzle(sql);
    
    // Run the migrations
    console.log("🚀 Running migrations...");
    await migrate(db, { migrationsFolder: "./drizzle" });
    
    console.log("✅ Migrations completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

runMigration(); 