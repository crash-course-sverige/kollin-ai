import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { PageSkeleton } from "@/components/app/page-skeleton";
import { TopicView } from "@/components/app/topic-view";
import { courses, getCourse, TOPIC_NAMES } from "@/mock";

export function generateStaticParams() {
  return courses.flatMap((c) => c.topics.map((t) => ({ code: c.code, topic: t.topicId })));
}

export async function generateMetadata({ params }: PageProps<"/app/course/[code]/topic/[topic]">): Promise<Metadata> {
  const { topic } = await params;
  return { title: TOPIC_NAMES[topic] ?? "Topic" };
}

async function Content({ params }: Pick<PageProps<"/app/course/[code]/topic/[topic]">, "params">) {
  const { code, topic } = await params;
  const course = getCourse(code);
  // AI-accepted topics (e.g. spektralsatsen) are not in the static list; they are
  // resolved on the client from the learner's state, so only the course must exist.
  if (!course) notFound();
  // TopicView reads ?mode= via useSearchParams, which needs its own boundary.
  return (
    <Suspense fallback={<PageSkeleton />}>
      <TopicView code={course.code} topicId={topic} />
    </Suspense>
  );
}

export default function TopicPage({ params }: PageProps<"/app/course/[code]/topic/[topic]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Content params={params} />
    </Suspense>
  );
}
