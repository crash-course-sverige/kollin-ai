"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Book, Network } from "lucide-react";
import { Course } from "@/lib/courses/types";

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{course.title}</CardTitle>
          {course.level && (
            <Badge variant={getLevelVariant(course.level)}>
              {course.level}
            </Badge>
          )}
        </div>
        <CardDescription>{course.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground">
          <div className="flex items-center gap-1 mb-1">
            <Book className="h-4 w-4" />
            <span>{course.concepts.length} concepts</span>
          </div>
          {course.estimatedHours && (
            <div>Estimated time: {course.estimatedHours} hours</div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-3 border-t">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/courses/${course.id}`}>View Course</Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/courses/${course.id}/knowledge-graph`}>
            <Network className="mr-2 h-4 w-4" />
            Knowledge Graph
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

// Helper to get badge variant based on course level
function getLevelVariant(level: string): "default" | "secondary" | "outline" {
  switch (level.toLowerCase()) {
    case "beginner":
      return "default";
    case "intermediate":
      return "secondary";
    case "advanced":
      return "outline";
    default:
      return "default";
  }
} 