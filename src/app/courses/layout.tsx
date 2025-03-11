import { Metadata } from "next";
import { CoursesSidebar } from "@/components/courses/sidebar";

export const metadata: Metadata = {
  title: "Courses",
  description: "Browse and learn from our interactive courses",
};

export default function CoursesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container flex-1 items-start md:grid md:grid-cols-[240px_1fr] md:gap-6 lg:grid-cols-[280px_1fr] lg:gap-10 py-8">
      <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 overflow-y-auto border-r md:sticky md:block">
        <CoursesSidebar />
      </aside>
      <main className="flex w-full flex-col overflow-hidden">
        {children}
      </main>
    </div>
  );
} 