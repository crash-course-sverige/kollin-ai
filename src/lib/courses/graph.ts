import { KnowledgeGraphData, KnowledgeGraphNode, KnowledgeGraphLink } from './types';
import { getCourseConceptsById } from './data';
import { runNeo4jQuery } from '../neo4j';

// Mock data for fallback when Neo4j is not available
const CONCEPT_RELATIONSHIPS: Record<string, Array<{ target: string; type: string; label: string }>> = {
  'concept-1': [
    { target: 'concept-2', type: 'PREREQUISITE_FOR', label: 'is prerequisite for' },
    { target: 'concept-3', type: 'RELATED_TO', label: 'is related to' },
  ],
  'concept-2': [
    { target: 'concept-3', type: 'RELATED_TO', label: 'is related to' },
  ],
  'concept-4': [
    { target: 'concept-5', type: 'PREREQUISITE_FOR', label: 'is prerequisite for' },
    { target: 'concept-6', type: 'RELATED_TO', label: 'is related to' },
  ],
  'concept-5': [
    { target: 'concept-6', type: 'RELATED_TO', label: 'is related to' },
  ],
  'concept-7': [
    { target: 'concept-8', type: 'PREREQUISITE_FOR', label: 'is prerequisite for' },
    { target: 'concept-9', type: 'RELATED_TO', label: 'is related to' },
  ],
  'concept-8': [
    { target: 'concept-9', type: 'PREREQUISITE_FOR', label: 'is prerequisite for' },
  ],
};

/**
 * Get knowledge graph data for visualization from Neo4j
 */
export async function getKnowledgeGraphData(courseId: string): Promise<KnowledgeGraphData> {
  try {
    // Try to fetch data from Neo4j
    const result = await runNeo4jQuery(
      `
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
      `,
      { courseId }
    );
    
    // Extract nodes from the result
    const concepts = result[0]?.concepts as any[] || [];
    const relationships = result[0]?.relationships as any[] || [];
    
    // If we got data from Neo4j, transform it to our graph data format
    if (concepts.length > 0) {
      console.log('Using Neo4j data for knowledge graph');
      
      // Create nodes from concepts
      const nodes: KnowledgeGraphNode[] = concepts.map((concept, index) => ({
        id: concept.properties.id,
        name: concept.properties.name,
        description: concept.properties.description,
        group: index % 3 + 1, // Assign group for styling
      }));
      
      // Create links from relationships
      const links: KnowledgeGraphLink[] = relationships
        .filter((rel: any) => rel.source && rel.target) // Filter out invalid relationships
        .map((rel: any) => ({
          source: rel.source,
          target: rel.target,
          type: rel.type,
          label: rel.label || rel.type.toLowerCase().replace('_', ' '),
          value: rel.type === 'PREREQUISITE_FOR' ? 2 : 1, // Stronger links for prerequisites
        }));
      
      return { nodes, links };
    }
    
    // If no Neo4j data, use mock data
    console.log('No Neo4j data found, using mock data for knowledge graph');
    return await getMockKnowledgeGraphData(courseId);
  } catch (error) {
    console.error('Error fetching Neo4j knowledge graph data:', error);
    // Fallback to mock data in case of error
    console.log('Using mock data for knowledge graph due to Neo4j error');
    return await getMockKnowledgeGraphData(courseId);
  }
}

/**
 * Get mock knowledge graph data (fallback)
 */
async function getMockKnowledgeGraphData(courseId: string): Promise<KnowledgeGraphData> {
  // For demo, we'll use mock data
  const concepts = await getCourseConceptsById(courseId);
  
  // Create nodes
  const nodes: KnowledgeGraphNode[] = concepts.map((concept, index) => ({
    id: concept.id,
    name: concept.name,
    description: concept.description,
    group: index % 3 + 1, // Assign group for styling (1, 2, or 3)
  }));
  
  // Create links between concepts
  const links: KnowledgeGraphLink[] = [];
  
  concepts.forEach(concept => {
    const relationships = CONCEPT_RELATIONSHIPS[concept.id];
    if (relationships) {
      relationships.forEach(rel => {
        // Only include relationships between concepts in this course
        if (concepts.some(c => c.id === rel.target)) {
          links.push({
            source: concept.id,
            target: rel.target,
            type: rel.type,
            label: rel.label,
            value: rel.type === 'PREREQUISITE_FOR' ? 2 : 1, // Stronger links for prerequisites
          });
        }
      });
    }
  });
  
  return { nodes, links };
} 