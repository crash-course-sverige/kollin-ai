import { edges, TOPIC_NAMES, type Course } from "@/mock";

/** Exercises and topic count per module, from the real tagging data. */
export function moduleTotals(course: Course) {
  return course.modules.map((name, i) => {
    const inModule = course.topics.filter((t) => t.module === i);
    return { name, topics: inModule.length, exercises: inModule.reduce((a, t) => a + t.exercises, 0) };
  });
}

/**
 * Where a new learner should start: topics nothing else in the course builds
 * on, most-tested first. Derived from the prerequisite edges, not hand-picked.
 */
export function startTopics(course: Course, n = 3) {
  const ids = new Set(course.topics.map((t) => t.topicId));
  const hasPrereq = new Set(edges.filter((e) => ids.has(e.from) && ids.has(e.to)).map((e) => e.to));
  return course.topics
    .filter((t) => !hasPrereq.has(t.topicId))
    .sort((a, b) => b.exercises - a.exercises)
    .slice(0, n)
    .map((t) => ({ id: t.topicId, name: TOPIC_NAMES[t.topicId] ?? t.topicId, exercises: t.exercises }));
}
