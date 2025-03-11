import { Metadata } from "next";
import { KnowledgeGraphClientWrapper } from "@/components/courses/knowledge-graph/client-wrapper";

export const metadata: Metadata = {
  title: "Calculus Knowledge Graph",
  description: "Interactive visualization of Calculus concepts and their relationships",
};

export default function CalculusKnowledgeGraphPage() {
  return (
    <main className="container py-6 md:py-8">
      <div className="space-y-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Calculus Knowledge Graph</h1>
        <p className="text-muted-foreground md:text-lg">
          Explore the relationships between calculus concepts in this interactive visualization
        </p>
      </div>
      
      <div className="mt-8">
        <KnowledgeGraphClientWrapper />
      </div>
    </main>
  );
} 