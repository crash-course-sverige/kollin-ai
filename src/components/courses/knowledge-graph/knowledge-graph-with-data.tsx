import { Suspense } from "react";
import { runNeo4jQuery } from "@/lib/neo4j";
import { KnowledgeGraphData, KnowledgeGraphNode, KnowledgeGraphLink } from "@/lib/courses/types";
import GraphVisualization from "./graph-visualization";
import { Card, CardContent } from "@/components/ui/card";

// Define type for Neo4j query results
type Neo4jQueryResult = Record<string, unknown>[];

// Fetch knowledge graph data from Neo4j
async function fetchKnowledgeGraphData(): Promise<KnowledgeGraphData> {
  try {
    // Query to get all nodes (concepts)
    const nodesResult = await runNeo4jQuery(`
      MATCH (c:Concept)
      RETURN 
        c.id as id, 
        c.name as name, 
        c.description as description,
        c.category as category,
        c.difficulty as difficulty,
        c.formula as formula
    `) as Neo4jQueryResult;
    
    // Query to get all relationships between concepts
    const linksResult = await runNeo4jQuery(`
      MATCH (source:Concept)-[rel:RELATIONSHIP]->(target:Concept)
      RETURN 
        source.id as source, 
        target.id as target, 
        rel.type as type
    `) as Neo4jQueryResult;
    
    // Transform to our visualization format with type safety
    const nodes: KnowledgeGraphNode[] = nodesResult.map((node) => ({
      id: String(node.id || ''),
      name: String(node.name || ''),
      description: String(node.description || ''),
      category: node.category ? String(node.category) : undefined,
      difficulty: node.difficulty ? String(node.difficulty) : undefined,
      formula: node.formula ? String(node.formula) : undefined,
      group: getCategoryGroup(node.category ? String(node.category) : undefined),
    }));
    
    const links: KnowledgeGraphLink[] = linksResult.map((link) => ({
      source: String(link.source || ''),
      target: String(link.target || ''),
      type: String(link.type || ''),
      label: getLinkLabel(String(link.type || '')),
      value: getLinkStrength(String(link.type || '')),
    }));
    
    return { nodes, links };
  } catch (error) {
    console.error("Error fetching knowledge graph data:", error);
    // Return empty data if there's an error
    return { nodes: [], links: [] };
  }
}

// Helper to get group number based on category
function getCategoryGroup(category?: string): number {
  if (!category) return 0;
  const categoryMap: Record<string, number> = {
    "prerequisite": 1,
    "limits": 2,
    "derivatives": 3,
    "integrals": 4,
    "applications": 5,
  };
  return categoryMap[category.toLowerCase()] || 0;
}

// Helper to get human-readable labels for relationships
function getLinkLabel(type: string): string {
  const labelMap: Record<string, string> = {
    "PREREQUISITE_FOR": "is prerequisite for",
    "PART_OF": "is part of",
    "APPLIED_IN": "is applied in",
    "RELATED_TO": "is related to",
  };
  return labelMap[type] || type.toLowerCase().replace(/_/g, ' ');
}

// Helper to get link strength based on relationship type
function getLinkStrength(type: string): number {
  const strengthMap: Record<string, number> = {
    "PREREQUISITE_FOR": 2,
    "PART_OF": 1.5,
    "APPLIED_IN": 1.5,
    "RELATED_TO": 1,
  };
  return strengthMap[type] || 1;
}

// Fallback component for loading state
function KnowledgeGraphLoading() {
  return (
    <Card className="w-full h-[600px] flex items-center justify-center bg-white dark:bg-gray-900">
      <CardContent className="flex flex-col items-center justify-center h-full">
        <div className="w-12 h-12 border-4 border-primary/60 border-t-primary rounded-full animate-spin mb-4"></div>
        <p className="text-muted-foreground">Loading knowledge graph data...</p>
      </CardContent>
    </Card>
  );
}

// Error fallback component
function KnowledgeGraphError() {
  return (
    <Card className="w-full h-[600px] flex items-center justify-center bg-white dark:bg-gray-900">
      <CardContent className="flex flex-col items-center justify-center h-full text-center">
        <div className="rounded-full bg-red-100 p-4 mb-4">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-8 w-8 text-red-500" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium mb-2">Failed to load knowledge graph</h3>
        <p className="text-muted-foreground max-w-md">
          There was an error loading the knowledge graph data. Please check your connection to the database or try again later.
        </p>
      </CardContent>
    </Card>
  );
}

// Main component that combines data fetching with visualization
export default async function KnowledgeGraphWithData() {
  try {
    const data = await fetchKnowledgeGraphData();
    
    if (data.nodes.length === 0) {
      return <KnowledgeGraphError />;
    }
    
    return (
      <Suspense fallback={<KnowledgeGraphLoading />}>
        <GraphVisualization data={data} />
      </Suspense>
    );
  } catch (error) {
    console.error("Error rendering knowledge graph:", error);
    return <KnowledgeGraphError />;
  }
} 