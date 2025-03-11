import { testNeo4jConnection, runNeo4jQuery, closeNeo4jDriver } from '../lib/neo4j';

// ID of the calculus course we want to check
const CALCULUS_COURSE_ID = 'calculus-fundamentals';

async function checkCalclusCourseData() {
  try {
    // Test connection first
    const connectionResult = await testNeo4jConnection();
    console.log('Neo4j Connection Test:', connectionResult.success ? 'SUCCESS' : 'FAILED');
    console.log(connectionResult.message);
    
    if (connectionResult.serverInfo) {
      console.log('Connected to Neo4j:', connectionResult.serverInfo.address);
      console.log('Neo4j Version:', connectionResult.serverInfo.version);
    }
    
    if (!connectionResult.success) {
      return;
    }
    
    // Check if the course exists
    console.log(`\nChecking for course with ID: ${CALCULUS_COURSE_ID}`);
    const courseResult = await runNeo4jQuery(
      'MATCH (c:Course {id: $courseId}) RETURN c',
      { courseId: CALCULUS_COURSE_ID }
    );
    
    if (courseResult.length === 0) {
      console.log('❌ Course not found in Neo4j database');
      
      // Check if any courses exist
      console.log('\nChecking for any courses in the database:');
      const allCourses = await runNeo4jQuery(
        'MATCH (c:Course) RETURN c.id as id, c.title as title LIMIT 5'
      );
      
      if (allCourses.length === 0) {
        console.log('❌ No courses found in the database');
      } else {
        console.log('Found courses:');
        allCourses.forEach((course: any) => {
          console.log(`- ${course.title} (${course.id})`);
        });
      }
    } else {
      console.log('✅ Course found!');
      console.log('Course details:', courseResult[0]['c'].properties);
      
      // Check for concepts in this course
      console.log('\nChecking concepts in this course:');
      const conceptsResult = await runNeo4jQuery(
        `
        MATCH (c:Course {id: $courseId})-[:CONTAINS]->(concept:Concept)
        RETURN count(concept) as conceptCount
        `,
        { courseId: CALCULUS_COURSE_ID }
      );
      
      const conceptCount = conceptsResult[0]['conceptCount'] as number;
      
      if (conceptCount === 0) {
        console.log('❌ No concepts found for this course');
      } else {
        console.log(`✅ Found ${conceptCount} concepts`);
        
        // Get a sample of concepts
        const sampleConcepts = await runNeo4jQuery(
          `
          MATCH (c:Course {id: $courseId})-[:CONTAINS]->(concept:Concept)
          RETURN concept.id as id, concept.name as name
          LIMIT 5
          `,
          { courseId: CALCULUS_COURSE_ID }
        );
        
        console.log('\nSample concepts:');
        sampleConcepts.forEach((concept: any) => {
          console.log(`- ${concept.name} (${concept.id})`);
        });
        
        // Check for relationships between concepts
        console.log('\nChecking for relationships between concepts:');
        const relationshipsResult = await runNeo4jQuery(
          `
          MATCH (c:Course {id: $courseId})-[:CONTAINS]->(concept:Concept)-[r]->(related:Concept)
          RETURN count(r) as relationshipCount
          `,
          { courseId: CALCULUS_COURSE_ID }
        );
        
        const relationshipCount = relationshipsResult[0]['relationshipCount'] as number;
        
        if (relationshipCount === 0) {
          console.log('❌ No relationships found between concepts');
        } else {
          console.log(`✅ Found ${relationshipCount} relationships`);
          
          // Get a sample of relationships
          const sampleRelationships = await runNeo4jQuery(
            `
            MATCH (c:Course {id: $courseId})-[:CONTAINS]->(concept:Concept)-[r]->(related:Concept)
            RETURN concept.name as source, type(r) as type, related.name as target
            LIMIT 5
            `,
            { courseId: CALCULUS_COURSE_ID }
          );
          
          console.log('\nSample relationships:');
          sampleRelationships.forEach((rel: any) => {
            console.log(`- "${rel.source}" ${rel.type} "${rel.target}"`);
          });
        }
      }
    }
    
    // Check the query that's actually used in the app
    console.log('\nTesting the actual knowledge graph data query:');
    const graphQuery = `
      MATCH (c:Course {id: $courseId})-[:CONTAINS]->(concept:Concept)
      WITH concept
      OPTIONAL MATCH (concept)-[r]->(related:Concept)
      RETURN collect(distinct concept) as concepts, 
             collect(distinct {
               source: concept.id, 
               target: related.id, 
               type: type(r), 
               label: r.label
             }) as relationships
    `;
    
    const graphResult = await runNeo4jQuery(graphQuery, { courseId: CALCULUS_COURSE_ID });
    console.log('Query result:', graphResult);
    
    const concepts = graphResult[0]?.concepts || [];
    const relationships = graphResult[0]?.relationships || [];
    
    console.log(`\nResult has ${concepts.length} concepts and ${relationships.length} relationships`);
    
    if (concepts.length === 0) {
      console.log('❌ No concepts found in graph query result');
    } else {
      console.log('✅ Got concepts in result');
    }
    
    // Finally, close the driver
    await closeNeo4jDriver();
    
  } catch (error) {
    console.error('Error testing Neo4j data:', error);
  }
}

// Run the test
checkCalclusCourseData(); 