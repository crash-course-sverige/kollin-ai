/**
 * Script to create a test user in Neo4j for assessment tracking
 */

import neo4j, { Driver } from 'neo4j-driver';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Get Neo4j connection info from environment variables
const NEO4J_URI = process.env.NEO4J_URI || 'neo4j+s://77376a67.databases.neo4j.io';
const NEO4J_USERNAME = process.env.NEO4J_USERNAME || 'neo4j';
const NEO4J_PASSWORD = process.env.NEO4J_PASSWORD || '';

// Test user details
const TEST_USER = {
  id: 'test-user-1',
  name: 'Test User',
  email: 'test@example.com',
  role: 'student'
};

async function main() {
  try {
    console.log('Creating test user in Neo4j...');
    
    // Connect to Neo4j
    const driver: Driver = neo4j.driver(
      NEO4J_URI,
      neo4j.auth.basic(NEO4J_USERNAME, NEO4J_PASSWORD)
    );
    
    const session = driver.session();
    
    try {
      // Create a user uniqueness constraint if it doesn't exist
      await session.run(`
        CREATE CONSTRAINT IF NOT EXISTS 
        FOR (u:User) REQUIRE u.id IS UNIQUE
      `);
      console.log('User constraint created or already exists');
      
      // Create or update the test user
      const userResult = await session.run(`
        MERGE (u:User {id: $user.id})
        ON CREATE SET
          u.name = $user.name,
          u.email = $user.email,
          u.role = $user.role,
          u.created_at = datetime()
        ON MATCH SET
          u.name = $user.name,
          u.email = $user.email,
          u.role = $user.role,
          u.updated_at = datetime()
        RETURN u
      `, { user: TEST_USER });
      
      console.log('Test user created or updated successfully');
      
      // Create some sample assessments for the test user
      const sampleAssessments = [
        { conceptId: 'limits_concept', assessment: 'understood' },
        { conceptId: 'derivatives_definition', assessment: 'not_understood' }
      ];
      
      for (const assessment of sampleAssessments) {
        try {
          await session.run(`
            MATCH (u:User {id: $userId})
            MATCH (c:Concept {id: $conceptId})
            MERGE (u)-[r:ASSESSED]->(c)
            ON CREATE SET
              r.assessment = $assessment,
              r.created_at = datetime(),
              r.updated_at = datetime()
            ON MATCH SET
              r.assessment = $assessment,
              r.updated_at = datetime()
            RETURN u, c, r
          `, {
            userId: TEST_USER.id,
            conceptId: assessment.conceptId,
            assessment: assessment.assessment
          });
        } catch (error) {
          console.warn(`Warning: Could not create assessment for concept ${assessment.conceptId}:`, error);
        }
      }
      
      console.log('Sample assessments created');
      
      // Check if the user was created successfully
      const checkResult = await session.run(`
        MATCH (u:User {id: $userId})
        OPTIONAL MATCH (u)-[r:ASSESSED]->(c:Concept)
        RETURN u.id as id, u.name as name, count(r) as assessmentCount
      `, { userId: TEST_USER.id });
      
      if (checkResult.records.length > 0) {
        const record = checkResult.records[0];
        console.log(`User: ${record.get('name')} (${record.get('id')})`);
        console.log(`Assessment count: ${record.get('assessmentCount').toInt()}`);
      }
      
    } finally {
      await session.close();
      await driver.close();
    }
    
    console.log('Done!');
    
  } catch (error) {
    console.error('Error creating test user:', error);
    process.exit(1);
  }
}

// Execute the script
main(); 