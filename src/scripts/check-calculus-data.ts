import { runNeo4jQuery, closeNeo4jDriver } from '../lib/neo4j';

// Course ID for calculus fundamentals
const COURSE_ID = 'calculus-fundamentals';

type CourseRecord = Record<string, string>;
type ConceptRecord = Record<string, string>;

async function checkCalcuusData() {
  try {
    console.log(`Checking data for course: ${COURSE_ID}`);
    
    // Check if the course exists
    const courseResult = await runNeo4jQuery(
      'MATCH (c:Course {id: $courseId}) RETURN c.id, c.title',
      { courseId: COURSE_ID }
    );
    
    if (courseResult.length === 0) {
      console.log('❌ Course not found in the database');
      
      // List all courses
      console.log('\nAvailable courses:');
      const allCourses = await runNeo4jQuery(
        'MATCH (c:Course) RETURN c.id, c.title'
      );
      
      allCourses.forEach((course: CourseRecord) => {
        console.log(`- ${course['c.title']} (${course['c.id']})`);
      });
      
      return;
    }
    
    console.log(`✅ Found course: ${courseResult[0]['c.title']}`);
    
    // Check for concepts
    const conceptsQuery = `
      MATCH (c:Course {id: $courseId})-[:CONTAINS]->(concept:Concept)
      RETURN count(concept) as count
    `;
    
    const conceptsResult = await runNeo4jQuery(conceptsQuery, { courseId: COURSE_ID });
    const conceptCount = Number(conceptsResult[0].count);
    
    if (conceptCount === 0) {
      console.log('❌ No concepts found for this course');
    } else {
      console.log(`✅ Found ${conceptCount} concepts for this course`);
      
      // Get a few sample concepts
      const sampleConcepts = await runNeo4jQuery(
        `
        MATCH (c:Course {id: $courseId})-[:CONTAINS]->(concept:Concept)
        RETURN concept.id, concept.name
        LIMIT 5
        `,
        { courseId: COURSE_ID }
      );
      
      console.log('\nSample concepts:');
      sampleConcepts.forEach((concept: ConceptRecord) => {
        console.log(`- ${concept['concept.name']} (${concept['concept.id']})`);
      });
      
      // Check relationships
      const relationshipsQuery = `
        MATCH (c:Course {id: $courseId})-[:CONTAINS]->(concept:Concept)-[r]->(related:Concept)
        RETURN count(r) as count
      `;
      
      const relationshipsResult = await runNeo4jQuery(relationshipsQuery, { courseId: COURSE_ID });
      const relationshipCount = Number(relationshipsResult[0].count);
      
      if (relationshipCount === 0) {
        console.log('❌ No relationships found between concepts');
      } else {
        console.log(`✅ Found ${relationshipCount} relationships between concepts`);
      }
    }
    
    await closeNeo4jDriver();
    
  } catch (error) {
    console.error('Error checking course data:', error);
    await closeNeo4jDriver();
  }
}

checkCalcuusData(); 