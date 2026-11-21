/**
 * 2x2 linear algebra for figures. The model only supplies a matrix and
 * vectors; every number that gets drawn or quoted is computed here, so a
 * figure can never contain hallucinated geometry.
 *
 * No imports on purpose: this file is unit-tested with Node directly.
 */

export type Vec2 = [number, number];
export type Mat2 = [[number, number], [number, number]];

const EPS = 1e-9;

export const apply = (m: Mat2, v: Vec2): Vec2 => [m[0][0] * v[0] + m[0][1] * v[1], m[1][0] * v[0] + m[1][1] * v[1]];
export const det = (m: Mat2) => m[0][0] * m[1][1] - m[0][1] * m[1][0];
export const trace = (m: Mat2) => m[0][0] + m[1][1];
export const cross = (a: Vec2, b: Vec2) => a[0] * b[1] - a[1] * b[0];
export const dot = (a: Vec2, b: Vec2) => a[0] * b[0] + a[1] * b[1];
export const norm = (v: Vec2) => Math.hypot(v[0], v[1]);

/** Unit vector, with the sign fixed so the first non-zero component is positive (stable output). */
function unit(v: Vec2): Vec2 {
  const n = norm(v);
  const u: Vec2 = [v[0] / n, v[1] / n];
  const lead = Math.abs(u[0]) > EPS ? u[0] : u[1];
  return lead < 0 ? [-u[0], -u[1]] : u;
}

export type EigenPair = { value: number; vector: Vec2 };

export type MatrixAnalysis = {
  det: number;
  trace: number;
  /** Real eigenpairs, largest |value| first. Empty when the eigenvalues are complex. */
  eigen: EigenPair[];
  /** true when the eigenvalues are complex (a rotation-like map): no real eigen-directions exist. */
  complex: boolean;
  /** true when A = cI: every direction is an eigenvector. */
  scalar: boolean;
  /** true when there is only one eigen-direction (defective matrix, e.g. a shear). */
  defective: boolean;
};

export function analyze(m: Mat2): MatrixAnalysis {
  const [[a, b], [c, d]] = m;
  const tr = a + d;
  const dt = a * d - b * c;
  const disc = tr * tr - 4 * dt;
  const base = { det: dt, trace: tr };

  if (disc < -EPS) return { ...base, eigen: [], complex: true, scalar: false, defective: false };

  const scalar = Math.abs(b) < EPS && Math.abs(c) < EPS && Math.abs(a - d) < EPS;
  if (scalar) {
    return {
      ...base,
      eigen: [
        { value: a, vector: [1, 0] },
        { value: a, vector: [0, 1] },
      ],
      complex: false,
      scalar: true,
      defective: false,
    };
  }

  const root = Math.sqrt(Math.max(disc, 0));
  const values = disc < EPS ? [tr / 2] : [(tr + root) / 2, (tr - root) / 2];

  const vectorFor = (lambda: number): Vec2 => {
    if (Math.abs(b) > EPS) return unit([b, lambda - a]);
    if (Math.abs(c) > EPS) return unit([lambda - d, c]);
    // diagonal matrix: the eigenvector is whichever axis owns this eigenvalue
    return Math.abs(a - lambda) < Math.abs(d - lambda) ? [1, 0] : [0, 1];
  };

  const eigen = values.map((value) => ({ value, vector: vectorFor(value) })).sort((p, q) => Math.abs(q.value) - Math.abs(p.value));
  return { ...base, eigen, complex: false, scalar: false, defective: values.length === 1 };
}

/** True when v and A v point along the same line (v is an eigenvector), within an angular tolerance. */
export function isEigenDirection(m: Mat2, v: Vec2, toleranceRad = 0.05): boolean {
  const w = apply(m, v);
  const nv = norm(v);
  const nw = norm(w);
  if (nv < EPS || nw < EPS) return false; // zero vector or collapsed to zero: not informative
  return Math.abs(cross(v, w)) / (nv * nw) < Math.sin(toleranceRad);
}

/** Format a number for display: trims float noise, keeps up to 3 decimals. */
export function fmt(n: number): string {
  if (Math.abs(n) < 1e-9) return "0";
  const r = Math.round(n * 1000) / 1000;
  return String(r).replace("-", "−");
}
