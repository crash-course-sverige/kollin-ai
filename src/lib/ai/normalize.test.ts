import assert from "node:assert/strict";
import { test } from "node:test";

import { normalizeBlock, normalizeFigure, normalizeLesson, normalizeToolInput } from "./normalize.ts";

// Shapes below are copied from what gemini-2.5-flash actually sent for showLesson.

test("text block written with `text` stays text", () => {
  assert.deepEqual(normalizeBlock({ type: "text", text: "Hej" }), { type: "text", text: "Hej" });
});

test("a text block missing its type-specific field name is read from `markdown`/`content`", () => {
  assert.deepEqual(normalizeBlock({ type: "text", markdown: "Hej" }), { type: "text", text: "Hej" });
  assert.deepEqual(normalizeBlock({ type: "paragraph", content: "Hej" }), { type: "text", text: "Hej" });
});

test("formula written as { formula } becomes { tex }", () => {
  assert.deepEqual(normalizeBlock({ type: "formula", formula: "Av = \\lambda v" }), { type: "formula", tex: "Av = \\lambda v" });
});

test("invented block type `remember` becomes a remember callout", () => {
  assert.deepEqual(normalizeBlock({ type: "remember", text: "Kom ihåg" }), { type: "callout", tone: "remember", text: "Kom ihåg" });
  assert.deepEqual(normalizeBlock({ type: "warning", text: "Se upp" }), { type: "callout", tone: "warning", text: "Se upp" });
  assert.equal((normalizeBlock({ type: "note", text: "x" }) as { tone: string }).tone, "tip");
});

test("callout with an unknown tone falls back to remember", () => {
  assert.equal((normalizeBlock({ type: "callout", tone: "banana", text: "x" }) as { tone: string }).tone, "remember");
});

test("worked example: workedExample alias, steps with { formula } and strings", () => {
  const out = normalizeBlock({
    type: "workedExample",
    steps: [{ formula: "\\det(A-\\lambda I)=0", text: "Börja här" }, { description: "Räkna ut", latex: "x=1" }, "Klart"],
  }) as { type: string; steps: { text: string; tex?: string }[] };
  assert.equal(out.type, "worked");
  assert.deepEqual(out.steps[0], { text: "Börja här", tex: "\\det(A-\\lambda I)=0" });
  assert.deepEqual(out.steps[1], { text: "Räkna ut", tex: "x=1" });
  assert.deepEqual(out.steps[2], { text: "Klart" });
});

test("a step with only a formula still gets a (empty) text", () => {
  const out = normalizeBlock({ type: "worked", steps: [{ formula: "x=1" }, { formula: "y=2" }] }) as { steps: { text: string }[] };
  assert.equal(out.steps[0].text, "");
});

test("figure: matrix as nested array and vectors as pairs", () => {
  const out = normalizeFigure({ matrix: [[2, 1], [1, 2]], vectors: [[1, 1], { x: 2, y: 0, label: "u" }] }) as { matrix: unknown; vectors: unknown[] };
  assert.deepEqual(out.matrix, { a: 2, b: 1, c: 1, d: 2 });
  assert.deepEqual(out.vectors, [{ x: 1, y: 1 }, { x: 2, y: 0, label: "u" }]);
});

test("figure block inside a lesson keeps `type` and gets a normalized matrix", () => {
  const out = normalizeBlock({ type: "visualization", matrix: [[3, 1], [1, 3]], draggable: true }) as { type: string; matrix: unknown };
  assert.equal(out.type, "figure");
  assert.deepEqual(out.matrix, { a: 3, b: 1, c: 1, d: 3 });
});

test("lesson: title defaults and every block is normalized", () => {
  const out = normalizeLesson({ blocks: [{ type: "heading", title: "Idén" }, { type: "remember", text: "x" }] }) as { title: string; blocks: { type: string }[] };
  assert.equal(out.title, "Lektion");
  assert.deepEqual(out.blocks.map((b) => b.type), ["heading", "callout"]);
});

test("normalizeToolInput only touches the visual tools", () => {
  assert.equal(normalizeToolInput("quiz", {}), undefined);
  assert.notEqual(normalizeToolInput("showLesson", { blocks: [] }), undefined);
  assert.notEqual(normalizeToolInput("showFigure", { matrix: [[1, 0], [0, 1]] }), undefined);
});

test("garbage in does not throw", () => {
  assert.equal(normalizeBlock(null), null);
  assert.equal(normalizeBlock("x"), "x");
  assert.deepEqual(normalizeLesson({ blocks: "nope" }), { title: "Lektion", blocks: [] });
});
