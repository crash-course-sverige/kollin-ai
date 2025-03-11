"use client";

import dynamic from "next/dynamic";
import { KnowledgeGraphData } from "@/lib/courses/types";

// Dynamic import with no SSR for D3 visualization
const GraphVisualization = dynamic(
  () => import("./graph-visualization"),
  { ssr: false }
);

// Dynamic import with no SSR for knowledge graph with data
const KnowledgeGraphWithData = dynamic(
  () => import("./knowledge-graph-with-data"),
  { ssr: false }
);

interface ClientWrapperProps {
  data?: KnowledgeGraphData;
}

export function KnowledgeGraphClientWrapper({ data }: ClientWrapperProps) {
  if (data) {
    return <GraphVisualization data={data} />;
  }
  
  return <KnowledgeGraphWithData />;
} 