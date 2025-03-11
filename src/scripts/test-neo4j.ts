/**
 * Simple script to test Neo4j connection
 * Run with: npx tsx src/scripts/test-neo4j.ts
 */

import { testNeo4jConnection, getNeo4jDriver, closeNeo4jDriver, runNeo4jQuery } from '../lib/neo4j';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function main() {
  console.log('Testing Neo4j connection...');
  console.log(`Neo4j URI: ${process.env.NEO4J_URI}`);
  
  try {
    // Test connection
    const connectionTest = await testNeo4jConnection();
    console.log('Connection test result:', connectionTest);
    
    if (connectionTest.success) {
      // Run a simple query
      console.log('\nRunning test query...');
      const result = await runNeo4jQuery('MATCH (n) RETURN count(n) as nodeCount LIMIT 1');
      console.log('Query result:', result);
      
      // Create test data if requested
      if (process.argv.includes('--create-test-data')) {
        console.log('\nCreating test data...');
        await createTestData();
      }
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Close the driver
    await closeNeo4jDriver();
    console.log('\nConnection closed.');
  }
}

async function createTestData() {
  const driver = getNeo4jDriver();
  const session = driver.session();
  
  try {
    // Create course and concepts for knowledge graph
    const result = await session.run(`
      // Create Mathematics course
      MERGE (c:Course {id: "mathematics-101", title: "Mathematics 101"})
      
      // Create concepts
      MERGE (c1:Concept {id: "concept-1", name: "Linear Algebra Basics", description: "Fundamental concepts of linear algebra."})
      MERGE (c2:Concept {id: "concept-2", name: "Matrix Operations", description: "Addition, subtraction, and multiplication of matrices."})
      MERGE (c3:Concept {id: "concept-3", name: "Vectors", description: "Vector operations and properties."})
      
      // Create relationships
      MERGE (c)-[:CONTAINS]->(c1)
      MERGE (c)-[:CONTAINS]->(c2)
      MERGE (c)-[:CONTAINS]->(c3)
      MERGE (c1)-[:PREREQUISITE_FOR {label: "is prerequisite for"}]->(c2)
      MERGE (c1)-[:RELATED_TO {label: "is related to"}]->(c3)
      MERGE (c2)-[:RELATED_TO {label: "is related to"}]->(c3)
      
      RETURN c, c1, c2, c3
    `);
    
    console.log('Test data created successfully:', result.summary.counters.updates());
  } finally {
    await session.close();
  }
}

main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
}); 