#!/usr/bin/env node
/**
 * Design token build.
 *
 *   tokens/kollin.tokens.json  ──►  src/styles/tokens.css
 *
 * - Resolves {alias} references.
 * - Converts sRGB hex to OKLCH (CSS Color 4 / Tailwind v4 native).
 * - Emits primitives into `@theme` (so `bg-burgundy-50` etc. exist as
 *   utilities) and semantic roles into `:root` / `.dark`.
 * - Verifies WCAG 2.x contrast for the pairs listed in the token file, in
 *   both modes. Exits 1 if an enforced pair fails.
 *
 * Usage: node scripts/build-tokens.mjs [--check]
 *   --check  verify only, do not write (used in CI)
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = resolve(root, "tokens/kollin.tokens.json");
const OUT = resolve(root, "src/styles/tokens.css");
const checkOnly = process.argv.includes("--check");

const tokens = JSON.parse(readFileSync(SRC, "utf8"));

/* ---------- token tree helpers ---------- */

const isToken = (node) => node && typeof node === "object" && "$value" in node;

/** Walk the tree, yielding [pathArray, token] for each leaf token. */
function* leaves(node, path = []) {
  if (isToken(node)) {
    yield [path, node];
    return;
  }
  for (const [key, child] of Object.entries(node)) {
    if (key.startsWith("$")) continue;
    if (child && typeof child === "object") yield* leaves(child, [...path, key]);
  }
}

const byPath = new Map();
for (const [path, tok] of leaves(tokens.color, ["color"])) {
  byPath.set(path.join("."), tok.$value);
}

function resolveValue(value, seen = new Set()) {
  const m = /^\{(.+)\}$/.exec(value);
  if (!m) return value;
  const ref = m[1];
  if (seen.has(ref)) throw new Error(`Circular token alias: ${ref}`);
  seen.add(ref);
  const target = byPath.get(ref);
  if (target === undefined) throw new Error(`Unknown token alias: {${ref}}`);
  return resolveValue(target, seen);
}

/* ---------- color math ---------- */

function hexToRgb(hex) {
  const h = hex.replace("#", "");
  if (!/^[0-9a-f]{6}$/i.test(h)) throw new Error(`Expected #RRGGBB, got ${hex}`);
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
}

const toLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);

function hexToOklch(hex) {
  const [r, g, b] = hexToRgb(hex).map(toLinear);
  // Linear sRGB -> LMS (Björn Ottosson's Oklab)
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const C = Math.hypot(A, B);
  let H = (Math.atan2(B, A) * 180) / Math.PI;
  if (H < 0) H += 360;
  return { L, C, H: C < 0.0004 ? 0 : H };
}

function oklchString(hex) {
  const { L, C, H } = hexToOklch(hex);
  const f = (n, d) => Number(n.toFixed(d)).toString();
  return `oklch(${f(L, 4)} ${f(C, 4)} ${f(H, 2)})`;
}

function luminance(hex) {
  const [r, g, b] = hexToRgb(hex).map(toLinear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/* ---------- build ---------- */

// Primitives -> @theme (kebab path under "color", DEFAULT folded into the parent)
const themeLines = [];
for (const [path, tok] of leaves(tokens.color, ["color"])) {
  const parts = path.slice(1); // drop "color"
  if (parts[0] === "dark") continue; // derived dark neutrals: internal, not utilities
  if (parts[0] === "level") continue; // exposed via semantic level-* roles
  const name = parts.filter((p) => p !== "DEFAULT").join("-");
  const hex = resolveValue(tok.$value);
  themeLines.push(`  --color-${name}: ${oklchString(hex)};`);
}

function semanticBlock(set) {
  const out = [];
  const hexes = {};
  for (const [key, tok] of Object.entries(tokens.semantic[set])) {
    if (key.startsWith("$")) continue;
    const hex = resolveValue(tok.$value);
    hexes[key] = hex;
    out.push(`  --${key}: ${oklchString(hex)};`);
  }
  return { css: out.join("\n"), hexes };
}

const light = semanticBlock("light");
const dark = semanticBlock("dark");

// Light and dark must define identical keys; drift here is a silent bug.
const lk = Object.keys(light.hexes).sort().join();
const dk = Object.keys(dark.hexes).sort().join();
if (lk !== dk) {
  const a = new Set(Object.keys(light.hexes));
  const b = new Set(Object.keys(dark.hexes));
  const missing = [...a].filter((k) => !b.has(k)).concat([...b].filter((k) => !a.has(k)));
  console.error(`✗ light and dark semantic sets differ: ${missing.join(", ")}`);
  process.exit(1);
}

/* ---------- contrast verification ---------- */

let failed = 0;
const rows = [];
for (const [mode, set] of [
  ["light", light.hexes],
  ["dark", dark.hexes],
]) {
  for (const p of tokens.contrast.pairs) {
    const fg = set[p.fg];
    const bg = set[p.bg];
    if (!fg || !bg) {
      console.error(`✗ contrast pair references unknown role: ${p.fg} / ${p.bg}`);
      process.exit(1);
    }
    const ratio = contrast(fg, bg);
    const ok = ratio >= p.min;
    if (!ok && !p.warn) failed++;
    rows.push({ mode, pair: `${p.fg} on ${p.bg}`, ratio: ratio.toFixed(2), min: p.min, status: ok ? "ok" : p.warn ? "warn" : "FAIL" });
  }
}

const bad = rows.filter((r) => r.status !== "ok");
console.log(`contrast: ${rows.length - bad.length}/${rows.length} pairs pass (light + dark)`);
for (const r of bad) {
  console.log(`  ${r.status === "FAIL" ? "✗" : "!"} [${r.mode}] ${r.pair}: ${r.ratio}:1 (need ${r.min}:1)${r.status === "warn" ? " (warning only)" : ""}`);
}
if (failed) {
  console.error(`\n✗ ${failed} contrast pair(s) below minimum. Fix tokens/kollin.tokens.json.`);
  process.exit(1);
}

if (checkOnly) {
  console.log("✓ tokens verified (check only, nothing written)");
  process.exit(0);
}

const css = `/*
 * GENERATED FILE. DO NOT EDIT.
 * Source: tokens/kollin.tokens.json   Build: pnpm tokens
 * Colors are OKLCH converted from the brand sRGB hex values.
 */

/* Primitives: expose as utilities (bg-burgundy-50, text-bordeaux, ...) */
@theme {
${themeLines.join("\n")}
}

/* Semantic roles: light */
:root {
${light.css}
}

/* Semantic roles: dark (class strategy, set by next-themes) */
.dark {
${dark.css}
}
`;

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, css);
console.log(`✓ wrote ${OUT.replace(root + "/", "")} (${themeLines.length} primitives, ${Object.keys(light.hexes).length} roles x 2 modes)`);
