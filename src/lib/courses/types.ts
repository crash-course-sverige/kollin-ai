// Course level type
export type CourseLevel = "Beginner" | "Intermediate" | "Advanced";

// Concept type for mathematical or other course concepts
export interface Concept {
  id: string;
  name: string;
  description: string;
}

// Relationship between concepts
export interface ConceptRelationship {
  source: string; // Concept ID
  target: string; // Concept ID
  type: string; // Relationship type (e.g., "PREREQUISITE_FOR", "RELATED_TO")
  label: string; // Human-readable description
}

// Course type
export interface Course {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  level?: CourseLevel;
  estimatedHours?: number;
  concepts: Concept[];
}

// Knowledge graph data type for visualization
export interface KnowledgeGraphData {
  nodes: KnowledgeGraphNode[];
  links: KnowledgeGraphLink[];
}

// Node in the knowledge graph visualization
export interface KnowledgeGraphNode {
  id: string;
  name: string;
  description?: string;
  group?: number; // For grouping/coloring nodes
  
  // Additional properties for educational visualization
  category?: string;        // Subject category (e.g., "prerequisite", "limits", "derivatives")
  difficulty?: string;      // Difficulty level (e.g., "basic", "intermediate", "advanced")
  formula?: string;         // Mathematical formula in LaTeX format
  examples?: unknown[];     // List of examples
  progress?: number;        // Learning progress (0-100%)
  mastered?: boolean;       // Whether the concept has been mastered
}

// Link/Edge in the knowledge graph visualization
export interface KnowledgeGraphLink {
  source: string;
  target: string;
  type: string;
  label?: string;
  value?: number; // For link strength/width
} 