import { content } from "./content";
import { courses, edges } from "./courses";
import { exams } from "./exams";
import { TOPIC_NAMES } from "./topics";
import type { Course, Edge, Exam, TopicContent } from "./types";

export { courses, edges, exams, content, TOPIC_NAMES };
export type * from "./types";

export const getCourse = (code: string): Course | undefined =>
  courses.find((c) => c.code.toLowerCase() === code.toLowerCase());

export const getExam = (id: string): Exam | undefined => exams.find((e) => e.id === id);
export const examsForCourse = (code: string): Exam[] => exams.filter((e) => e.course === code);

export const getContent = (topicId: string): TopicContent | undefined => content[topicId];

/** Edges where both ends are present in the given topic set. */
export function courseEdges(topicIds: Set<string>, extra: Edge[] = []): Edge[] {
  return [...edges, ...extra].filter((e) => topicIds.has(e.from) && topicIds.has(e.to));
}

/** All topics that are (transitively) required for / unlocked by `id`. */
export function lineage(id: string, es: Edge[]) {
  const up = new Set<string>();
  const down = new Set<string>();
  const walk = (start: string, dir: "up" | "down", out: Set<string>) => {
    const stack = [start];
    while (stack.length) {
      const cur = stack.pop()!;
      for (const e of es) {
        const next = dir === "up" ? (e.to === cur ? e.from : null) : e.from === cur ? e.to : null;
        if (next && !out.has(next)) {
          out.add(next);
          stack.push(next);
        }
      }
    }
  };
  walk(id, "up", up);
  walk(id, "down", down);
  return { up, down };
}
