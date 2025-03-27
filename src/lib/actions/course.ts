"use server"

import { runNeo4jQuery } from "../neo4j"

interface Neo4jNode {
  properties: {
    id: string;
    name: string;
    description?: string;
  };
}

interface Neo4jRelation {
  type: string;
  startNode: Neo4jNode;
  endNode: Neo4jNode;
}

interface Neo4jResult {
  nodes: Neo4jNode[];
  targets: Neo4jNode[];
  relations: Neo4jRelation[];
}

export async function getCourseNodes(datasetName: string) {
  const query = `
    MATCH (n:\`${datasetName}\`) 
    OPTIONAL MATCH (n)-[r1]->(m)
    OPTIONAL MATCH (n)<-[r2]-(o)
    RETURN n, r1, m, r2, o
  `;
  
  const result = await runNeo4jQuery(query);
  console.log("Raw Neo4j result:", JSON.stringify(result, null, 2));
  
  // Transform the data into the format expected by the graph visualization
  const nodesMap = new Map<string, any>();
  const links: any[] = [];
  
  result.forEach((record: any) => {
    // Add the main node
    const mainNode = {
      id: record.n.properties.id,
      name: record.n.properties.name,
      description: record.n.properties.description || '',
      group: 0
    };
    nodesMap.set(mainNode.id, mainNode);
    
    // Process outgoing relationship (r1)
    if (record.r1 && record.m) {
      const targetNode = {
        id: record.m.properties.id,
        name: record.m.properties.name,
        description: record.m.properties.description || '',
        group: 0
      };
      nodesMap.set(targetNode.id, targetNode);
      
      links.push({
        source: mainNode.id,
        target: targetNode.id,
        type: record.r1.type,
        label: record.r1.type,
        value: 1
      });
    }
    
    // Process incoming relationship (r2)
    if (record.r2 && record.o) {
      const sourceNode = {
        id: record.o.properties.id,
        name: record.o.properties.name,
        description: record.o.properties.description || '',
        group: 0
      };
      nodesMap.set(sourceNode.id, sourceNode);
      
      links.push({
        source: sourceNode.id,
        target: mainNode.id,
        type: record.r2.type,
        label: record.r2.type,
        value: 1
      });
    }
  });

  const transformedData = {
    nodes: Array.from(nodesMap.values()),
    links: links
  };
  
  console.log("Final transformed data:", JSON.stringify(transformedData, null, 2));
  return transformedData;
}