import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { PageSkeleton } from "@/components/app/page-skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { courses, examsForCourse, getCourse } from "@/mock";

export function generateStaticParams() {
  return courses.map((c) => ({ code: c.code }));
}

export const metadata: Metadata = { title: "Exams" };

async function Content({ params }: Pick<PageProps<"/app/course/[code]/exams">, "params">) {
  const { code } = await params;
  const course = getCourse(code);
  if (!course) notFound();
  const list = examsForCourse(course.code);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <Typography role="eyebrow">{course.schoolShort} · {course.code}</Typography>
        <Typography role="display-lg" as="h1">Exams</Typography>
        <Typography role="body-sm" tone="muted">
          {list.length > 0 && list.length < course.exams ? `${list.length} of ${course.exams} exams extracted so far.` : `${course.exams} exams analysed.`} Each is split into exercises and parts, and every part is tagged with the topics it tests.
        </Typography>
      </div>

      {list.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Being prepared</CardTitle>
            <CardDescription>
              The AI is still reading the {course.exams} exams for {course.code}. Parts and topics appear here as they are extracted. Topics that {course.code} shares with other courses are already on the map.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {list.map((e) => {
            const parts = e.exercises.reduce((n, x) => n + x.subs.length, 0);
            return (
              <Link key={e.id} href={`/app/course/${course.code}/exam/${e.id}`} className="block">
                <Card className="h-full transition-colors hover:bg-muted">
                  <CardHeader>
                    <CardDescription>{e.date}</CardDescription>
                    <CardTitle>{e.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Typography role="body-sm" tone="muted">{e.exercises.length} exercises · {parts} parts</Typography>
                    {e.proposals.length > 0 && (
                      <Typography role="caption" tone="accent" className="mt-2 normal-case">
                        {e.proposals.length} new topic suggested by AI
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function ExamsPage({ params }: PageProps<"/app/course/[code]/exams">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Content params={params} />
    </Suspense>
  );
}
