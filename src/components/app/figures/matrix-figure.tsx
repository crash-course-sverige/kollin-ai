"use client";

import { Coordinates, Line, Mafs, Point, Polygon, Text, useMovablePoint, Vector } from "mafs";
import "mafs/core.css";
import { Move } from "lucide-react";
import { useMemo } from "react";

import type { FigureInput } from "@/lib/ai/visual";
import { toMat2 } from "@/lib/ai/visual";
import { analyze, apply, det, dot, fmt, isEigenDirection, type Mat2, type Vec2 } from "@/lib/math/linalg";

/** Series colors come from chart tokens, so they follow light/dark mode. */
const SERIES = ["var(--chart-1)", "var(--chart-4)", "var(--chart-5)", "var(--chart-2)"];
const MUTED = "var(--muted-foreground)";

const snap = (v: number) => Math.round(v * 4) / 4;

/**
 * What a 2x2 matrix does to the plane. The model only provides the matrix and
 * vectors; this component computes every image and eigen-direction itself, so
 * what is drawn is always consistent with the matrix.
 */
export function MatrixFigure({ matrix, vectors = [], showEigenvectors = true, showUnitSquare = false, draggable = false, caption }: FigureInput) {
  const M: Mat2 = useMemo(() => toMat2(matrix), [matrix]);
  const info = useMemo(() => analyze(M), [M]);

  // Movable probe vector. Always called (hooks), only shown when `draggable`.
  const probe = useMovablePoint([1, 1], {
    color: SERIES[0],
    constrain: ([x, y]) => [Math.max(-12, Math.min(12, snap(x))), Math.max(-12, Math.min(12, snap(y)))],
  });
  const v: Vec2 = [probe.x, probe.y];
  const Av = apply(M, v);
  const onEigen = draggable && isEigenDirection(M, v);
  const lambdaHere = dot(v, Av) / (dot(v, v) || 1);

  // Visible region: everything we draw, with breathing room, symmetric around the origin.
  const R = useMemo(() => {
    const pts: Vec2[] = [];
    for (const u of vectors) pts.push([u.x, u.y], apply(M, [u.x, u.y]));
    if (showUnitSquare) pts.push([1, 1], apply(M, [1, 1]), apply(M, [1, 0]), apply(M, [0, 1]));
    if (draggable) pts.push([4, 4]);
    for (const e of info.eigen) pts.push(e.vector, [e.vector[0] * Math.abs(e.value), e.vector[1] * Math.abs(e.value)]);
    const m = Math.max(2, ...pts.flatMap((p) => [Math.abs(p[0]), Math.abs(p[1])]));
    return Math.min(30, Math.ceil(m * 1.25));
  }, [vectors, M, showUnitSquare, draggable, info.eigen]);

  const [[a, b], [c, d]] = M;
  const description = `Matrix ${a}, ${b}; ${c}, ${d}. ${info.complex ? "Complex eigenvalues, no real eigenvectors." : `Eigenvalues ${info.eigen.map((e) => fmt(e.value)).join(" and ")}.`}`;

  return (
    <figure className="kollin-figure not-prose my-3 overflow-hidden rounded-xl border border-border bg-card">
      <div role="img" aria-label={description}>
        <Mafs width="auto" height={280} pan={false} zoom={false} viewBox={{ x: [-R, R], y: [-R, R] }} preserveAspectRatio="contain">
          <Coordinates.Cartesian xAxis={{ lines: Math.max(1, Math.round(R / 4)) }} yAxis={{ lines: Math.max(1, Math.round(R / 4)) }} />

          {showUnitSquare && (
            <>
              <Polygon points={[[0, 0], [1, 0], [1, 1], [0, 1]]} color={MUTED} fillOpacity={0.1} weight={1.5} />
              <Polygon points={[[0, 0], apply(M, [1, 0]), apply(M, [1, 1]), apply(M, [0, 1])]} color={SERIES[0]} fillOpacity={0.16} weight={2} />
            </>
          )}

          {showEigenvectors &&
            info.eigen.map((e, i) => (
              <g key={`eig-${i}`}>
                <Line.ThroughPoints point1={[0, 0]} point2={e.vector} color={MUTED} style="dashed" opacity={0.7} weight={1.5} />
                <Text x={e.vector[0] * R * 0.8} y={e.vector[1] * R * 0.8} attach="ne" size={13} color={MUTED}>
                  {`λ = ${fmt(e.value)}`}
                </Text>
              </g>
            ))}

          {vectors.map((u, i) => {
            const tip: Vec2 = [u.x, u.y];
            const img = apply(M, tip);
            const color = SERIES[i % SERIES.length];
            return (
              <g key={`v-${i}`}>
                <Vector tail={[0, 0]} tip={img} color={color} style="dashed" opacity={0.55} weight={2} />
                <Vector tail={[0, 0]} tip={tip} color={color} weight={3} />
                <Text x={tip[0]} y={tip[1]} attach="nw" size={13} color={color}>
                  {u.label ?? `v${vectors.length > 1 ? i + 1 : ""}`}
                </Text>
                <Text x={img[0]} y={img[1]} attach="ne" size={13} color={color}>
                  {`A${u.label ?? `v${vectors.length > 1 ? i + 1 : ""}`}`}
                </Text>
              </g>
            );
          })}

          {draggable && (
            <>
              <Vector tail={[0, 0]} tip={Av} color={onEigen ? "var(--level-easy)" : SERIES[1]} style="dashed" opacity={0.8} weight={2.5} />
              <Vector tail={[0, 0]} tip={v} color={SERIES[0]} weight={3} />
              <Text x={Av[0]} y={Av[1]} attach="ne" size={13} color={onEigen ? "var(--level-easy-foreground)" : SERIES[1]}>
                Av
              </Text>
              {probe.element}
            </>
          )}
          <Point x={0} y={0} color="var(--foreground)" />
        </Mafs>
      </div>

      {draggable && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border-subtle px-3 py-2 text-sm tabular-nums">
          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
            <Move className="size-3.5" /> Dra v
          </span>
          <span>v = ({fmt(v[0])}, {fmt(v[1])})</span>
          <span>Av = ({fmt(Av[0])}, {fmt(Av[1])})</span>
          {onEigen && (
            <span className="rounded-full border border-level-easy-border bg-level-easy-muted px-2 py-0.5 text-xs font-medium text-level-easy-foreground">
              egenvektor, λ = {fmt(lambdaHere)}
            </span>
          )}
        </div>
      )}

      <figcaption className="border-t border-border-subtle px-3 py-2 text-xs text-muted-foreground">
        {caption ? <span>{caption} </span> : null}
        <span className="tabular-nums">
          det = {fmt(det(M))} · spår = {fmt(a + d)} ·{" "}
          {info.complex ? "komplexa egenvärden (inga reella egenvektorer)" : info.scalar ? `alla riktningar är egenvektorer, λ = ${fmt(a)}` : `egenvärden ${info.eigen.map((e) => fmt(e.value)).join(", ")}`}
          {info.defective ? " (bara en egenriktning)" : ""}
        </span>
      </figcaption>
    </figure>
  );
}
