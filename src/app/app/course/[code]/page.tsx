import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { PageSkeleton } from "@/components/app/page-skeleton";
import { TopicMap } from "@/components/app/topic-map";
import { courses, getCourse } from "@/mock";

export function generateStaticParams() {
  return courses.map((c) => ({ code: c.code }));
}

export async function generateMetadata({ params }: PageProps<"/app/course/[code]">): Promise<Metadata> {
  const { code } = await params;
  const c = getCourse(code);
  return { title: c ? `${c.code} topic map` : "Course" };
}

async function Content({ params }: Pick<PageProps<"/app/course/[code]">, "params">) {
  const { code } = await params;
  const course = getCourse(code);
  if (!course) notFound();
  return <TopicMap code={course.code} />;
}

export default function CoursePage({ params }: PageProps<"/app/course/[code]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Content params={params} />
    </Suspense>
  );
}
