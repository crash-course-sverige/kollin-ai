import { tool } from "ai";
import { z } from "zod";

import { edges, exams, getContent, getCourse, TOPIC_NAMES } from "@/mock";

import { describeMatrix, figureInput, lessonInput, matrixInput } from "./visual";

/**
 * What the server knows about the learner for this request. Today it is sent
 * by the browser (progress lives in localStorage); once the database exists it
 * will be loaded server-side from the session instead.
 */
export type LearnerState = {
  /** topicId -> mastery 0-100 (only studied topics) */
  mastery: Record<string, number>;
  /** topic ids due for review */
  due: string[];
  /** topics the learner accepted from AI suggestions */
  accepted: { id: string; name: string; parent: string; module: number; course: string }[];
};

export type TutorContext = {
  course?: string;
  topicId?: string;
  learner: LearnerState;
  userId: string;
};

export const quizInput = z
  .object({
    topicId: z.string().describe("Id of the topic this question tests"),
    question: z
      .string()
      .describe("The question. Must be self-contained: if it refers to a matrix or formula, put that in `display`. Never write \"the matrix below\" without a `display`. Inline math as $...$."),
    options: z.array(z.string()).min(2).max(5).describe("Answer options, plain text with optional $math$"),
    correctIndex: z.number().int().min(0).describe("Index of the correct option"),
    explanation: z.string().describe("Why the correct option is right, shown after answering"),
    display: z.string().max(300).optional().describe("LaTeX shown as a centred formula under the question, e.g. a matrix. No $ delimiters. REQUIRED whenever the question refers to a matrix or formula."),
    hint: z.string().min(1).max(240).describe("A nudge shown after a wrong first answer, WITHOUT giving the answer away. The learner may then try once more."),
  })
  // Weak models write "the matrix A" and forget to show it. Reject that, with a message they can act on.
  .refine((q) => q.correctIndex < q.options.length, { message: "correctIndex must point at one of the options.", path: ["correctIndex"] })
  .refine((q) => !/matris|matrix/i.test(q.question) || Boolean(q.display) || /pmatrix|\[\[|\\begin\{/.test(q.question), {
    message: "The question mentions a matrix but never shows it. Put the matrix in `display` as LaTeX (for example B=\\begin{pmatrix}2&0\\\\0&5\\end{pmatrix}).",
    path: ["display"],
  });

export const quizOutput = z.object({
  chosen: z.number().int().describe("The option the learner finally settled on"),
  correct: z.boolean(),
  attempts: z.number().int().min(1).max(2).describe("1 = answered once. 2 = needed the hint and tried again."),
});

/**
 * Tool set for the tutor.
 *  - Server tools (have `execute`): read the course material, so answers are grounded.
 *  - Client tools (no `execute`): the browser fulfils them with `addToolOutput`
 *    (an interactive quiz, a navigation). The model waits for the result.
 *  - saveNote has `execute` but requires approval (see `toolApproval` in the agent).
 */
export function makeTools(ctx: TutorContext) {
  const names: Record<string, string> = { ...TOPIC_NAMES };
  for (const a of ctx.learner.accepted) names[a.id] = a.name;
  const nameOf = (id: string) => names[id] ?? id;
  /**
   * Weak models sometimes invent ids. Instead of returning an empty result the
   * model would happily explain away, hand back a correctable error.
   */
  const unknownTopic = (id: string) => ({
    error: `Unknown topic id "${id}".`,
    fix: "Call searchTopics to find the right id, or use the id of the topic the learner has open.",
    currentTopic: ctx.topicId ?? null,
    exampleIds: Object.keys(names).slice(0, 8),
  });

  return {
    searchTopics: tool({
      description:
        "Search the topics of the learner's course by name or keyword. Use first when the learner mentions a concept and you need its topic id.",
      inputSchema: z.object({ query: z.string().describe("Keyword or concept, Swedish or English") }),
      execute: async ({ query }) => {
        const course = ctx.course ? getCourse(ctx.course) : undefined;
        const inCourse = new Set(course?.topics.map((t) => t.topicId) ?? Object.keys(names));
        for (const a of ctx.learner.accepted) inCourse.add(a.id);
        const words = query.toLowerCase().split(/\s+/).filter((w) => w.length > 1);
        const hits = [...inCourse]
          .map((id) => {
            const n = nameOf(id).toLowerCase();
            const score = words.reduce((s, w) => s + (n.includes(w) ? 2 : 0) + (id.includes(w) ? 1 : 0), 0);
            return { id, name: nameOf(id), score, mastery: ctx.learner.mastery[id] ?? null };
          })
          .filter((h) => h.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, 5)
          .map(({ id, name, mastery }) => ({ id, name, mastery }));
        return { query, results: hits };
      },
    }),

    getTopic: tool({
      description: "Get the written theory, formulas and key points for one topic, plus what it builds on and unlocks.",
      inputSchema: z.object({ topicId: z.string() }),
      execute: async ({ topicId }) => {
        if (!names[topicId]) return unknownTopic(topicId);
        const c = getContent(topicId);
        return {
          id: topicId,
          name: nameOf(topicId),
          written: Boolean(c),
          blurb: c?.blurb ?? null,
          theory: c ? c.theory.map((b) => (b.t === "list" ? b.items.map((i) => `- ${i}`).join("\n") : b.t === "math" ? b.tex : b.text)).join("\n\n") : null,
          formulas: c?.formulas ?? [],
          takeaways: c?.takeaways ?? [],
          buildsOn: edges.filter((e) => e.to === topicId).map((e) => ({ id: e.from, name: nameOf(e.from) })),
          unlocks: edges.filter((e) => e.from === topicId).map((e) => ({ id: e.to, name: nameOf(e.to) })),
          learnerMastery: ctx.learner.mastery[topicId] ?? null,
        };
      },
    }),

    findExamParts: tool({
      description:
        "Find real exam parts that test a topic, to ground an explanation or to pick practice. Returns the part text, points and a link. Reveal answers only if the learner asks.",
      inputSchema: z.object({ topicId: z.string(), limit: z.number().int().min(1).max(6).default(3) }),
      execute: async ({ topicId, limit }) => {
        if (!names[topicId]) return unknownTopic(topicId);
        const parts = exams
          .filter((e) => !ctx.course || e.course === ctx.course)
          .flatMap((e) =>
            e.exercises.flatMap((ex) =>
              ex.subs
                .filter((s) => s.topics.includes(topicId))
                .map((s) => ({
                  examId: e.id,
                  examTitle: e.title,
                  course: e.course,
                  exercise: ex.number,
                  part: s.label,
                  points: s.points,
                  text: ex.intro ? `${ex.intro} ${s.text}` : s.text,
                  hints: s.hints,
                  answer: s.answer,
                  href: `/app/course/${e.course}/exam/${e.id}#${s.id}`,
                })),
            ),
          )
          .slice(0, limit);
        return { topicId, topicName: nameOf(topicId), count: parts.length, parts };
      },
    }),

    /** CLIENT tool: rendered as an interactive question; the learner's answer comes back as the output. */
    quiz: tool({
      description:
        "Ask the learner ONE multiple-choice question and wait for their answer. Use to check understanding or when they ask to practise. Write the question yourself, based on the topic material. Do not call twice in a row.",
      inputSchema: quizInput,
      outputSchema: quizOutput,
    }),

    /** CLIENT tool: navigates the app. */
    openTopic: tool({
      description: "Open a topic page in the app for the learner. Use when they ask to go to a topic or after recommending one.",
      inputSchema: z.object({ topicId: z.string(), mode: z.enum(["theory", "practice"]).default("theory") }),
      outputSchema: z.object({ opened: z.boolean() }),
    }),

    /** Ground truth for matrix text. Call BEFORE writing about a specific matrix. */
    analyzeMatrix: tool({
      description:
        "Compute determinant, trace, eigenvalues and eigenvector directions of a 2x2 matrix. Call this before you write any numbers about a specific matrix, and quote its results exactly.",
      inputSchema: z.object({ matrix: matrixInput }),
      execute: async ({ matrix }) => describeMatrix(matrix),
    }),

    /** Draws a matrix figure in the chat. The browser computes and renders the geometry from the matrix. */
    showFigure: tool({
      description:
        "Show an interactive figure of what a 2x2 matrix does geometrically: vectors and their images, eigen-directions, the unit square, or a draggable vector. Give only the matrix and vectors; the app computes and draws everything, so never invent coordinates.",
      inputSchema: figureInput,
      execute: async ({ matrix }) => ({ shown: true as const, facts: describeMatrix(matrix) }),
    }),

    /** A structured mini lesson: headings, text, formulas, figures, worked examples, callouts. */
    showLesson: tool({
      description:
        "Present a structured lesson (headings, text, formulas, figures, a worked example, a remember-callout). Use when the learner asks for an in-depth explanation of a topic. Call analyzeMatrix first for any matrix you mention. After it, add at most one short sentence and offer a quiz.",
      inputSchema: lessonInput,
      execute: async ({ title }) => ({ shown: true as const, title }),
    }),

    /** Requires the learner's approval before it runs. The browser then applies the saved note. */
    saveNote: tool({
      description: "Save a short note to the learner's notebook for a topic. Only when the learner asks you to save something.",
      inputSchema: z.object({ topicId: z.string(), text: z.string().max(600).describe("The note, plain text, $math$ allowed") }),
      execute: async ({ topicId, text }) => ({ saved: true as const, topicId, topicName: nameOf(topicId), text }),
    }),
  };
}

export type TutorTools = ReturnType<typeof makeTools>;
