import { Metadata } from "next";
import Link from "next/link";
import { CourseCard } from "@/components/courses/course-card";
import { getCourses } from "@/lib/courses/data";

export const metadata: Metadata = {
  title: "Courses",
  description: "Browse all available courses",
};

export default async function CoursesPage() {
  // Fetch courses data
  const courses = await getCourses();
  
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Courses</h1>
        <p className="text-muted-foreground mt-2">
          Browse our interactive courses and expand your knowledge.
        </p>
      </div>
      
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  );
} 