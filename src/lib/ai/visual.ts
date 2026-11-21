import { z } from "zod";

import { analyze, fmt, type Mat2 } from "@/lib/math/linalg";

/**
 * Schemas for what the tutor may SHOW (figures, lessons). The model supplies
 * intent (a matrix, some vectors, text); the client computes and draws the
 * geometry. Bounds keep every figure legible and cheap to render.
 *
 * Plain objects ({a,b,c,d}, {x,y}) instead of tuples: several providers
 * handle tuple JSON schemas badly.
 */

const coord = z.number().min(-20).max(20);

export const matrixInput = z
  .object({ a: coord, b: coord, c: coord, d: coord })
  .describe("The 2x2 matrix [[a, b], [c, d]] (rows: a b / c d)");

export const figureInput = z.object({
  matrix: matrixInput,
  vectors: z
    .array(z.object({ x: coord, y: coord, label: z.string().max(24).optional() }))
    .max(4)
    .optional()
    .describe("Vectors to draw. Each is drawn with its image A·v (dashed). Omit to draw only eigen-directions."),
  showEigenvectors: z.boolean().optional().describe("Draw the real eigen-directions of the matrix (default true)"),
  showUnitSquare: z.boolean().optional().describe("Draw the unit square and its image: shows how area scales by |det|"),
  draggable: z.boolean().optional().describe("Let the learner drag a vector v and watch A·v (default false). Great for discovering eigenvectors."),
  caption: z.string().max(240).optional().describe("One sentence under the figure. Add 'schematic, not to scale' only if it truly is."),
});
export type FigureInput = z.infer<typeof figureInput>;

export const lessonBlock = z.discriminatedUnion("type", [
  z.object({ type: z.literal("heading"), text: z.string().max(100) }),
  z.object({ type: z.literal("text"), text: z.string().max(1200).describe("Markdown with inline math as $...$") }),
  z.object({ type: z.literal("formula"), tex: z.string().max(300).describe("LaTeX for a displayed formula, no $ delimiters") }),
  z.object({ type: z.literal("figure") }).merge(figureInput),
  z.object({
    type: z.literal("worked"),
    title: z.string().max(100).optional(),
    steps: z
      .array(z.object({ text: z.string().max(400).describe("What we do in this step. Inline math as $...$"), tex: z.string().max(300).optional().describe("Displayed formula for this step") }))
      .min(2)
      .max(8),
  }),
  z.object({ type: z.literal("callout"), tone: z.enum(["remember", "warning", "tip"]), text: z.string().max(400) }),
]);
export type LessonBlock = z.infer<typeof lessonBlock>;

export const lessonInput = z.object({
  title: z.string().max(100),
  blocks: z
    .array(lessonBlock)
    .min(2)
    .max(14)
    .describe(
      "Blocks, each with a `type`: {type:'heading',text} | {type:'text',text} | {type:'formula',tex} | {type:'figure',matrix:{a,b,c,d},vectors?,showEigenvectors?,draggable?,caption?} | {type:'worked',title?,steps:[{text,tex?}]} | {type:'callout',tone:'remember'|'warning'|'tip',text}. Use exactly these field names.",
    ),
});
export type LessonInput = z.infer<typeof lessonInput>;

/** a,b,c,d -> Mat2 */
export const toMat2 = (m: { a: number; b: number; c: number; d: number }): Mat2 => [[m.a, m.b], [m.c, m.d]];

/**
 * Ground truth about a matrix, returned to the MODEL by `analyzeMatrix`
 * so lesson text quotes computed numbers instead of guessing them.
 */
export function describeMatrix(m: { a: number; b: number; c: number; d: number }) {
  const r = analyze(toMat2(m));
  return {
    determinant: Number(fmt(r.det).replace("−", "-")),
    trace: Number(fmt(r.trace).replace("−", "-")),
    eigenvalues: r.complex ? "complex (no real eigenvectors)" : r.eigen.map((e) => Number(fmt(e.value).replace("−", "-"))),
    eigenvectors: r.eigen.map((e) => ({ value: Number(fmt(e.value).replace("−", "-")), direction: [Number(fmt(e.vector[0]).replace("−", "-")), Number(fmt(e.vector[1]).replace("−", "-"))] })),
    scalarMatrix: r.scalar,
    defective: r.defective,
    areaScale: Math.abs(r.det),
  };
}

export { normalizeBlock, normalizeFigure, normalizeLesson, normalizeToolInput } from "./normalize";
