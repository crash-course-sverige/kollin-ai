import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCourseById } from "@/lib/courses/data";
import { getKnowledgeGraphData } from "@/lib/courses/graph";
import { Card } from "@/components/ui/card";
import { KnowledgeGraphClientWrapper } from "@/components/courses/knowledge-graph/client-wrapper";

export async function generateMetadata({
  params,
}: {
  params: { courseId: string };
}): Promise<Metadata> {
  const course = await getCourseById(params.courseId);
  
  if (!course) {
    return {
      title: "Knowledge Graph Not Found",
    };
  }
  
  return {
    title: `${course.title} - Knowledge Graph`,
    description: `Interactive knowledge graph for ${course.title}`,
  };
}

export default async function KnowledgeGraphPage({
  params,
}: {
  params: { courseId: string };
}) {
  const course = await getCourseById(params.courseId);
  
  if (!course) {
    notFound();
  }
  
  // Fetch knowledge graph data
  const graphData = await getKnowledgeGraphData(params.courseId);
  
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {course.title} - Knowledge Graph
        </h1>
        <p className="text-muted-foreground mt-2">
          Explore the relationships between different concepts in this course.
        </p>
      </div>
      
      <Card className="p-6">
        <div className="h-[600px] w-full">
          <KnowledgeGraphClientWrapper data={graphData} />
        </div>
      </Card>
    </div>
  );
} 