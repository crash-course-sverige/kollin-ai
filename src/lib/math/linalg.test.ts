import assert from "node:assert/strict";
import { test } from "node:test";

import { analyze, apply, det, isEigenDirection, type Mat2 } from "./linalg.ts";

const close = (a: number, b: number, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} !~ ${b}`);

test("symmetric matrix [[3,1],[1,3]] has eigenvalues 4 and 2 along (1,1) and (1,-1)", () => {
  const r = analyze([[3, 1], [1, 3]]);
  assert.equal(r.complex, false);
  close(r.eigen[0].value, 4);
  close(r.eigen[1].value, 2);
  close(Math.abs(r.eigen[0].vector[0]), Math.SQRT1_2);
  close(r.eigen[0].vector[0], r.eigen[0].vector[1]); // (1,1)/sqrt2
  close(r.eigen[1].vector[0], -r.eigen[1].vector[1]); // (1,-1)/sqrt2
  close(r.det, 8);
  close(r.trace, 6);
});

test("every returned eigenpair really satisfies A v = lambda v", () => {
  const mats: Mat2[] = [[[2, 1], [0, 3]], [[4, -2], [1, 1]], [[0, 1], [1, 0]], [[5, 0], [0, 2]], [[1, 2], [3, 4]], [[2, 0], [0, 5]]];
  for (const m of mats) {
    const r = analyze(m);
    for (const { value, vector } of r.eigen) {
      const w = apply(m, vector);
      close(w[0], value * vector[0], 1e-9);
      close(w[1], value * vector[1], 1e-9);
    }
  }
});

test("diagonal matrix: eigenvectors are the axes", () => {
  const r = analyze([[2, 0], [0, 5]]);
  assert.deepEqual(r.eigen.map((e) => e.value), [5, 2]);
  assert.deepEqual(r.eigen[0].vector, [0, 1]);
  assert.deepEqual(r.eigen[1].vector, [1, 0]);
});

test("rotation by 90 degrees has complex eigenvalues and no real eigen-directions", () => {
  const r = analyze([[0, -1], [1, 0]]);
  assert.equal(r.complex, true);
  assert.equal(r.eigen.length, 0);
});

test("shear [[1,1],[0,1]] is defective: one eigenvalue, one direction", () => {
  const r = analyze([[1, 1], [0, 1]]);
  assert.equal(r.defective, true);
  assert.equal(r.eigen.length, 1);
  close(r.eigen[0].value, 1);
  assert.deepEqual(r.eigen[0].vector, [1, 0]);
});

test("scalar matrix: every direction is an eigenvector", () => {
  const r = analyze([[3, 0], [0, 3]]);
  assert.equal(r.scalar, true);
  assert.equal(r.eigen.length, 2);
});

test("isEigenDirection", () => {
  const m: Mat2 = [[3, 1], [1, 3]];
  assert.equal(isEigenDirection(m, [1, 1]), true);
  assert.equal(isEigenDirection(m, [1, -1]), true);
  assert.equal(isEigenDirection(m, [1, 0]), false);
  assert.equal(isEigenDirection(m, [0, 0]), false);
});

test("det", () => close(det([[1, 2], [3, 4]]), -2));
