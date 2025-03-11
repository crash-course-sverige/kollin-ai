/**
 * Basic Knowledge Graph Upload Script
 * 
 * Loads a knowledge graph JSON into Neo4j.
 */

import fs from 'fs';
import path from 'path';
import neo4j, { Driver } from 'neo4j-driver';
import dotenv from 'dotenv';

// Load environment variables directly (because the script runs outside Next.js)
dotenv.config({ path: '.env.local' });

// Path to dataset JSON file
const DATA_FILE = path.join(process.cwd(), 'src/data/kg_basic.json');

// Get Neo4j connection info from environment variables
const NEO4J_URI = process.env.NEO4J_URI || 'neo4j+s://77376a67.databases.neo4j.io';
const NEO4J_USERNAME = process.env.NEO4J_USERNAME || 'neo4j';
const NEO4J_PASSWORD = process.env.NEO4J_PASSWORD || '';

console.log(`Neo4j connection info:
  URI: ${NEO4J_URI}
  Username: ${NEO4J_USERNAME}
  Password: ${NEO4J_PASSWORD ? '[REDACTED]' : '[NOT SET]'}
`);

type ConceptNode = {
  id: string;
  name: string;
  description: string;
  longDescription?: string;
  category?: string;
  difficulty?: string;
  formula?: string;
  examples?: unknown[];
};

type Edge = {
  source: string;
  target: string;
  type: string;  // e.g., "PREREQUISITE_FOR", "PART_OF", etc.
};

type KnowledgeGraph = {
  nodes: ConceptNode[];
  links?: Edge[];
  edges?: Edge[];
};

// Cypher queries
const CREATE_CONSTRAINT_QUERY = `
CREATE CONSTRAINT IF NOT EXISTS 
FOR (c:Concept) REQUIRE c.id IS UNIQUE
`;

const MERGE_CONCEPTS_QUERY = `
UNWIND $nodes AS node
MERGE (c:Concept { id: node.id })
  ON CREATE SET
    c.name = node.name,
    c.description = node.description,
    c.longDescription = node.longDescription,
    c.category = node.category,
    c.difficulty = node.difficulty,
    c.formula = node.formula
  ON MATCH SET
    c.name = node.name,
    c.description = node.description,
    c.longDescription = node.longDescription,
    c.category = node.category,
    c.difficulty = node.difficulty,
    c.formula = node.formula
`;

const MERGE_RELATIONSHIPS_QUERY = `
UNWIND $edges AS edge
MATCH (source:Concept {id: edge.source})
MATCH (target:Concept {id: edge.target})
CALL {
  WITH source, target, edge
  MERGE (source)-[r:RELATIONSHIP {type: edge.type}]->(target)
  RETURN r
}
RETURN count(*) as relationshipsCreated
`;

async function main() {
  try {
    // 1) Read the JSON dataset
    console.log('Loading data from:', DATA_FILE);
    const fileContent = fs.readFileSync(DATA_FILE, 'utf-8');
    const data: KnowledgeGraph = JSON.parse(fileContent);
    
    // Validate data structure
    if (!data.nodes || !Array.isArray(data.nodes)) {
      throw new Error('Invalid data format: nodes array is missing');
    }
    
    // Extract edges/links from the data - handle either format
    const edges = data.edges || data.links || [];
    
    if (!edges || !Array.isArray(edges) || edges.length === 0) {
      console.warn('Warning: No relationships (edges/links) found in the data');
    } else {
      console.log(`Found ${edges.length} relationships in the data`);
    }
    
    // 2) Connect to Neo4j
    console.log('Connecting to Neo4j...');
    const driver: Driver = neo4j.driver(
      NEO4J_URI,
      neo4j.auth.basic(NEO4J_USERNAME, NEO4J_PASSWORD)
    );
    
    const session = driver.session();
    
    try {
      // 3) Create uniqueness constraint
      await session.run(CREATE_CONSTRAINT_QUERY);
      console.log('Constraint created (or already exists).');
      
      // 4) Merge concepts (nodes)
      await session.run(MERGE_CONCEPTS_QUERY, { nodes: data.nodes });
      console.log(`Merged ${data.nodes.length} concepts.`);
      
      // 5) Merge relationships (edges)
      if (edges.length > 0) {
        await session.run(MERGE_RELATIONSHIPS_QUERY, { edges });
        console.log(`Merged ${edges.length} relationships.`);
      }
      
      console.log('Knowledge graph data loaded successfully.');
    } finally {
      await session.close();
      await driver.close();
    }
  } catch (error) {
    console.error('Error importing data:', error);
    process.exit(1);
  }
  
  console.log('Done!');
}

// Execute the script if run directly
if (require.main === module) {
  main();
}