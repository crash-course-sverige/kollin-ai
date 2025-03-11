import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getCourseById } from "@/lib/courses/data";
import { BookOpen, Network } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: { courseId: string };
}): Promise<Metadata> {
  const course = await getCourseById(params.courseId);
  
  if (!course) {
    return {
      title: "Course Not Found",
    };
  }
  
  return {
    title: course.title,
    description: course.description,
  };
}

export default async function CoursePage({
  params,
}: {
  params: { courseId: string };
}) {
  const course = await getCourseById(params.courseId);
  
  if (!course) {
    notFound();
  }
  
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{course.title}</h1>
        <p className="text-muted-foreground mt-2">{course.description}</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Course Content</h2>
          <p className="mb-4">{course.longDescription}</p>
          <div className="mt-4">
            <Button className="mr-4">
              <BookOpen className="mr-2 h-4 w-4" />
              Start Learning
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/courses/${params.courseId}/knowledge-graph`}>
                <Network className="mr-2 h-4 w-4" />
                View Knowledge Graph
              </Link>
            </Button>
          </div>
        </Card>
        
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Key Concepts</h2>
          <ul className="list-disc pl-5 space-y-2">
            {course.concepts.map((concept) => (
              <li key={concept.id}>{concept.name}</li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
} 