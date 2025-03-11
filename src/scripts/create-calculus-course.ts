/**
 * Script to create a Calculus course node and connect it to all concepts.
 */

import neo4j, { Driver } from 'neo4j-driver';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Get Neo4j connection info from environment variables
const NEO4J_URI = process.env.NEO4J_URI || 'neo4j+s://77376a67.databases.neo4j.io';
const NEO4J_USERNAME = process.env.NEO4J_USERNAME || 'neo4j';
const NEO4J_PASSWORD = process.env.NEO4J_PASSWORD || '';

// Course details
const COURSE = {
  id: 'calculus-fundamentals',
  title: 'Calculus Fundamentals',
  description: 'Core principles of differential and integral calculus',
  longDescription: 'Master the essential concepts of calculus including limits, derivatives, and integrals. This course builds a strong foundation for advanced mathematics and physics.',
  level: 'Intermediate'
};

// Cypher queries
const CREATE_COURSE_QUERY = `
MERGE (c:Course {id: $course.id})
  ON CREATE SET
    c.title = $course.title,
    c.description = $course.description,
    c.longDescription = $course.longDescription,
    c.level = $course.level
  ON MATCH SET
    c.title = $course.title,
    c.description = $course.description,
    c.longDescription = $course.longDescription,
    c.level = $course.level
RETURN c
`;

const CONNECT_CONCEPTS_QUERY = `
MATCH (course:Course {id: $courseId})
MATCH (concept:Concept)
MERGE (course)-[:CONTAINS]->(concept)
RETURN count(concept) as conceptsConnected
`;

async function main() {
  try {
    console.log('Creating calculus course and connecting to concepts...');
    
    // Connect to Neo4j
    const driver: Driver = neo4j.driver(
      NEO4J_URI,
      neo4j.auth.basic(NEO4J_USERNAME, NEO4J_PASSWORD)
    );
    
    const session = driver.session();
    
    try {
      // Create the course node
      const courseResult = await session.run(CREATE_COURSE_QUERY, { 
        course: COURSE 
      });
      
      if (courseResult.records.length > 0) {
        console.log('Course created or updated successfully');
      }
      
      // Connect the course to all concepts
      const connectResult = await session.run(CONNECT_CONCEPTS_QUERY, { 
        courseId: COURSE.id 
      });
      
      const conceptsConnected = connectResult.records[0]?.get('conceptsConnected');
      console.log(`Connected course to ${conceptsConnected} concepts`);
      
    } finally {
      await session.close();
      await driver.close();
    }
    
    console.log('Done!');
    
  } catch (error) {
    console.error('Error creating calculus course:', error);
    process.exit(1);
  }
}

// Execute the script
main(); 