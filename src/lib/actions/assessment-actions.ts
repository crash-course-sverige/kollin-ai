'use server';

import { runNeo4jQuery } from '@/lib/neo4j';
import { db } from '@/lib/db';
import { createUserAssessmentSchema } from '@/lib/db/schema/user-assessments';
import { generateUUID } from '@/lib/utils';
import { sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

// Define recommendation type
interface Recommendation {
  id: string;
  name: string;
  description: string | null;
}

// Define Neo4j result types using more flexible interfaces
interface Neo4jRecord {
  get: (key: string) => string | null;
}

// Using Record<string, unknown>[] | { records?: Neo4jRecord[] } to avoid any
type Neo4jResult = Record<string, unknown>[] | { 
  records?: Neo4jRecord[];
};

/**
 * Server action to create or update a user assessment
 */
export async function createOrUpdateAssessment(formData: FormData) {
  try {
    // Parse form data
    const userId = formData.get('user_id') as string;
    const nodeId = formData.get('node_id') as string;
    const assessment = formData.get('assessment') as 'understood' | 'not_understood';
    
    // Validate input
    if (!userId || !nodeId || !assessment) {
      return {
        success: false,
        message: 'Missing required fields'
      };
    }

    const data = {
      user_id: userId,
      node_id: nodeId,
      assessment: assessment
    };

    // Validate with Zod schema
    try {
      createUserAssessmentSchema.parse(data);
    } catch {
      // Silently catch validation errors
      return {
        success: false,
        message: 'Invalid input data'
      };
    }

    const now = new Date();

    // Check if this assessment already exists using SQL
    const existingAssessments = await db.execute(
      sql`SELECT * FROM user_assessments 
          WHERE user_id = ${data.user_id} AND node_id = ${data.node_id} 
          LIMIT 1`
    );
    
    const existingAssessment = existingAssessments.length > 0 ? existingAssessments[0] : null;

    if (existingAssessment) {
      // Update existing assessment
      await db.execute(
        sql`UPDATE user_assessments 
            SET assessment = ${data.assessment}, updated_at = ${now}
            WHERE user_id = ${data.user_id} AND node_id = ${data.node_id}`
      );
    } else {
      // Create new assessment
      await db.execute(
        sql`INSERT INTO user_assessments (id, user_id, node_id, assessment, created_at, updated_at)
            VALUES (${generateUUID()}, ${data.user_id}, ${data.node_id}, ${data.assessment}, ${now}, ${now})`
      );
    }

    // Get recommendations if the user didn't understand the concept
    let recommendations: Recommendation[] = [];

    if (data.assessment === 'not_understood') {
      // Query Neo4j for prerequisites of the current concept
      const query = `
        MATCH (c:Concept {id: $nodeId})<-[:PREREQUISITE_FOR]-(prereq:Concept)
        RETURN prereq.id as id, prereq.name as name, prereq.description as description
        LIMIT 5
      `;

      const result = await runNeo4jQuery(query, { nodeId: data.node_id }) as Neo4jResult;
      
      if ('records' in result && result.records && Array.isArray(result.records)) {
        recommendations = result.records.map((record: Neo4jRecord) => ({
          id: record.get('id') || '',
          name: record.get('name') || 'Unknown',
          description: record.get('description')
        }));
      }
    }

    // Revalidate the path to update UI
    revalidatePath('/courses/calculus');
    revalidatePath('/courses');

    return {
      success: true,
      message: 'Assessment saved successfully',
      recommendations
    };
  } catch (error) {
    console.error('Error in createOrUpdateAssessment:', error);
    return {
      success: false,
      message: 'An error occurred while saving the assessment'
    };
  }
}

// Define assessment result type with a more flexible structure
type AssessmentRecord = {
  id: string;
  node_id: string;
  user_id: string;
  assessment: string;
  created_at: Date | string;
  updated_at: Date | string;
  [key: string]: unknown;
};

/**
 * Server action to get user assessments
 */
export async function getUserAssessments(userId: string) {
  try {
    if (!userId) {
      return {
        success: false,
        message: 'User ID is required'
      };
    }
    
    // Query the PostgreSQL database using SQL directly
    const assessments = await db.execute(
      sql`SELECT * FROM user_assessments 
          WHERE user_id = ${userId}
          ORDER BY updated_at DESC`
    ) as unknown as AssessmentRecord[];
    
    // Fetch concept names from Neo4j to include in the response
    const nodeIds = [...new Set(assessments.map(a => a.node_id))];
    const conceptInfo: Record<string, { name: string; description: string | null }> = {};
    
    if (nodeIds.length > 0) {
      // Query Neo4j for concept details
      const query = `
        MATCH (c:Concept)
        WHERE c.id IN $nodeIds
        RETURN c.id as id, c.name as name, c.description as description
      `;
      
      const result = await runNeo4jQuery(query, { nodeIds }) as Neo4jResult;
      
      if ('records' in result && result.records && Array.isArray(result.records)) {
        result.records.forEach((record: Neo4jRecord) => {
          const id = record.get('id');
          if (id) {
            conceptInfo[id] = {
              name: record.get('name') || 'Unknown',
              description: record.get('description')
            };
          }
        });
      }
    }
    
    // Combine the data
    const enrichedAssessments = assessments.map((assessment: AssessmentRecord) => {
      const conceptData = conceptInfo[assessment.node_id] || {
        name: "Unknown Concept",
        description: null
      };
      
      return {
        id: assessment.id,
        nodeId: assessment.node_id,
        conceptName: conceptData.name,
        conceptDescription: conceptData.description,
        assessment: assessment.assessment,
        updatedAt: new Date(assessment.updated_at).toISOString()
      };
    });

    return {
      success: true,
      assessments: enrichedAssessments
    };
  } catch (error) {
    console.error('Error in getUserAssessments:', error);
    return {
      success: false,
      message: 'An error occurred while retrieving assessments',
      error: String(error)
    };
  }
} 