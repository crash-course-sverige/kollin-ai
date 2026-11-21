/**
 * Shape normalizer for model-written tool inputs. Import-free on purpose so it
 * can be unit-tested with plain Node.
 */

/* -------------------------------------------------------------------------
 * Normalizer. Models often get the SHAPE slightly wrong (a `text` field where
 * we say `markdown`, a block type like "remember" or "workedExample"). Fixing
 * that in code is free; a retry would re-send the whole conversation.
 * Used on the server (repairToolCall) and on the client before rendering.
 * ----------------------------------------------------------------------- */

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);
const firstString = (...vals: unknown[]) => vals.find((v): v is string => typeof v === "string" && v.length > 0);

const TYPE_ALIASES: Record<string, string> = {
  workedexample: "worked",
  worked_example: "worked",
  "worked-example": "worked",
  example: "worked",
  paragraph: "text",
  markdown: "text",
  body: "text",
  p: "text",
  equation: "formula",
  math: "formula",
  latex: "formula",
  visualization: "figure",
  visualisation: "figure",
  plot: "figure",
  diagram: "figure",
  title: "heading",
  section: "heading",
  h2: "heading",
  h3: "heading",
};
const CALLOUT_TYPES = new Set(["callout", "remember", "warning", "tip", "note", "info"]);

function normalizeMatrix(m: unknown): unknown {
  // [[a,b],[c,d]] -> {a,b,c,d}
  if (Array.isArray(m) && m.length === 2 && Array.isArray(m[0]) && Array.isArray(m[1])) {
    return { a: m[0][0], b: m[0][1], c: m[1][0], d: m[1][1] };
  }
  return m;
}

export function normalizeFigure(raw: unknown): unknown {
  if (!isObj(raw)) return raw;
  const out: Obj = { ...raw, matrix: normalizeMatrix(raw.matrix) };
  if (Array.isArray(raw.vectors)) {
    out.vectors = raw.vectors.map((v) => (Array.isArray(v) ? { x: v[0], y: v[1] } : v));
  }
  return out;
}

function normalizeSteps(steps: unknown): unknown[] {
  if (!Array.isArray(steps)) return [];
  return steps.map((s) => {
    if (typeof s === "string") return { text: s };
    if (!isObj(s)) return s;
    return {
      text: firstString(s.text, s.description, s.explanation, s.step, s.content, s.title) ?? "",
      tex: firstString(s.tex, s.formula, s.latex, s.math, s.equation),
    };
  });
}

export function normalizeBlock(raw: unknown): unknown {
  if (!isObj(raw)) return raw;
  let type = String(raw.type ?? "").toLowerCase().replace(/\s+/g, "");
  type = TYPE_ALIASES[type] ?? type;

  if (CALLOUT_TYPES.has(type)) {
    const guess = type === "callout" ? "remember" : type === "note" || type === "info" ? "tip" : type;
    const tone = ["remember", "warning", "tip"].includes(String(raw.tone)) ? raw.tone : guess;
    return { type: "callout", tone, text: firstString(raw.text, raw.content, raw.body, raw.message, raw.markdown) ?? "" };
  }
  switch (type) {
    case "heading":
      return { type, text: firstString(raw.text, raw.title, raw.content, raw.heading) ?? "" };
    case "text":
      return { type, text: firstString(raw.text, raw.markdown, raw.content, raw.body) ?? "" };
    case "formula":
      return { type, tex: firstString(raw.tex, raw.formula, raw.latex, raw.equation, raw.text) ?? "" };
    case "figure":
      return { ...(normalizeFigure(raw) as Obj), type };
    case "worked":
      return { type, title: firstString(raw.title, raw.heading), steps: normalizeSteps(raw.steps ?? raw.items) };
    default:
      return raw;
  }
}

export function normalizeLesson(raw: unknown): unknown {
  if (!isObj(raw)) return raw;
  return {
    title: firstString(raw.title, raw.name) ?? "Lektion",
    blocks: Array.isArray(raw.blocks) ? raw.blocks.map(normalizeBlock) : [],
  };
}

/** Entry point for the server repair hook. Returns undefined when nothing applies. */
export function normalizeToolInput(toolName: string, input: unknown): unknown {
  if (toolName === "showLesson") return normalizeLesson(input);
  if (toolName === "showFigure") return normalizeFigure(input);
  return undefined;
}
