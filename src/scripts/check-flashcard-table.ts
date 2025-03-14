import postgres from "postgres";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const DATABASE_URL = process.env.DATABASE_URL as string;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL not found");
}

async function main() {
  const sql = postgres(DATABASE_URL, { max: 1 });
  
  try {
    console.log("📊 Checking flashcard_progress table structure...");
    
    // Get column information for the flashcard_progress table
    const columns = await sql`
      SELECT column_name, data_type, character_maximum_length, column_default, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'flashcard_progress'
      ORDER BY ordinal_position;
    `;
    
    console.log("\n📋 Flashcard Progress Table Structure:");
    console.table(columns);
    
    // Check for foreign keys
    const foreignKeys = await sql`
      SELECT
        tc.constraint_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM
        information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = 'flashcard_progress';
    `;
    
    console.log("\n🔗 Foreign Key Relationships:");
    console.table(foreignKeys);
    
    // Check if there's any data already in the table
    const count = await sql`SELECT COUNT(*) FROM flashcard_progress`;
    console.log(`\n📈 Current record count: ${count[0].count}`);
    
    console.log("\n✅ Table check complete!");
  } catch (error) {
    console.error("❌ Error checking table:", error);
  } finally {
    await sql.end();
  }
}

main(); 