import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ExamView } from "@/components/app/exam-view";
import { PageSkeleton } from "@/components/app/page-skeleton";
import { exams, getCourse, getExam } from "@/mock";

export function generateStaticParams() {
  return exams.map((e) => ({ code: e.course, exam: e.id }));
}

export const metadata: Metadata = { title: "Exam" };

async function Content({ params }: Pick<PageProps<"/app/course/[code]/exam/[exam]">, "params">) {
  const { code, exam } = await params;
  const course = getCourse(code);
  const e = getExam(exam);
  if (!course || !e || e.course !== course.code) notFound();
  return <ExamView code={course.code} examId={e.id} />;
}

export default function ExamPage({ params }: PageProps<"/app/course/[code]/exam/[exam]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Content params={params} />
    </Suspense>
  );
}
