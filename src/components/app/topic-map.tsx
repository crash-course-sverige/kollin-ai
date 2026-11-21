"use client";

import { GraduationCap, List, Lock, Network } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

import { MasteryBadge, masteryBarClass } from "@/components/mastery-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Typography } from "@/components/ui/typography";
import { dueLabel, edgesOf, masteryState, topicsOf, useStudy } from "@/lib/study";
import { getCourse, lineage } from "@/mock";
import { cn } from "@/lib/utils";

import { useAiScope } from "./ai-context";

const W = 232; // node width
const H = 72; // node height
const GX = 84; // gap between columns
const GY = 12; // gap between rows
const HEAD = 56; // column header height

type View = "map" | "list";

const wideQuery = "(min-width: 768px)";
const subscribeWide = (cb: () => void) => {
  const m = window.matchMedia(wideQuery);
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
};
const getWide = () => window.matchMedia(wideQuery).matches;
const getWideServer = () => null;

export function TopicMap({ code }: { code: string }) {
  const { ready, state, scores, nameOf, actions, course: active } = useStudy();
  const course = getCourse(code)!;
  // Phones default to the list, wider screens to the map; the toggle overrides.
  // null on the server and first client render, so there is no hydration mismatch.
  const wide = useSyncExternalStore(subscribeWide, getWide, getWideServer);
  const [override, setView] = useState<View | null>(null);
  const view: View | null = override ?? (wide === null ? null : wide ? "map" : "list");
  const [hover, setHover] = useState<string | null>(null);

  // Route drives the active course.
  useEffect(() => {
    if (ready && active.code !== code) actions.setCourse(code);
  }, [ready, active.code, code, actions]);

  useAiScope({ label: `${course.code} topic map`, course: course.code });

  const accepted = useMemo(() => state?.accepted ?? [], [state]);
  const topics = useMemo(() => topicsOf(code, accepted), [code, accepted]);
  const edges = useMemo(() => edgesOf(code, accepted), [code, accepted]);

  const rows = useMemo(() => {
    const byModule: string[][] = course.modules.map(() => []);
    topics.forEach((t) => byModule[t.module].push(t.id));
    return byModule;
  }, [course, topics]);

  const pos = useMemo(() => {
    const p: Record<string, { x: number; y: number }> = {};
    rows.forEach((ids, mi) => ids.forEach((id, ri) => (p[id] = { x: mi * (W + GX), y: HEAD + ri * (H + GY) })));
    return p;
  }, [rows]);

  const width = course.modules.length * (W + GX) - GX;
  const height = HEAD + Math.max(...rows.map((r) => r.length)) * (H + GY);

  const focus = hover ? lineage(hover, edges) : null;
  const inFocus = (id: string) => !focus || id === hover || focus.up.has(id) || focus.down.has(id);

  const prereqsOf = (id: string) => edges.filter((e) => e.to === id).map((e) => e.from);
  const locked = (id: string) => !scores[id]?.started && prereqsOf(id).some((p) => !scores[p]?.started);

  if (!ready || view === null) {
    return (
      <div className="space-y-4" aria-busy>
        <Skeleton className="h-10 w-80" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const counts = {
    mastered: topics.filter((t) => masteryState(scores[t.id]) === "mastered").length,
    started: topics.filter((t) => scores[t.id]?.started).length,
  };

  const describe = hover
    ? (() => {
        const needs = prereqsOf(hover).map(nameOf);
        const unlocks = edges.filter((e) => e.from === hover).map((e) => nameOf(e.to));
        return { name: nameOf(hover), needs, unlocks };
      })()
    : null;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <Typography role="eyebrow">{course.schoolShort} · {course.credits} hp</Typography>
          <Typography role="display-lg" as="h1">{course.code} · {course.name}</Typography>
          <Typography role="body-sm" tone="muted">
            {topics.length} topics from {course.exams} exams · {counts.started} started · {counts.mastered} mastered
          </Typography>
        </div>
        <div className="flex items-center gap-2">
          <ToggleGroup type="single" value={view} onValueChange={(v) => v && setView(v as View)} variant="outline" aria-label="View">
            <ToggleGroupItem value="map" aria-label="Map view"><Network className="size-4" /> Map</ToggleGroupItem>
            <ToggleGroupItem value="list" aria-label="List view"><List className="size-4" /> List</ToggleGroupItem>
          </ToggleGroup>
          <Button asChild variant="outline"><Link href={`/app/course/${code}/exams`}><GraduationCap /> Exams</Link></Button>
        </div>
      </div>

      {view === "map" ? (
        <>
          {/* Inspector line: the same information as the highlight, in words. */}
          <div className="flex min-h-9 flex-wrap items-center gap-x-4 gap-y-1 rounded-lg border border-border-subtle bg-card px-3 py-2 text-sm" aria-live="polite">
            {describe ? (
              <>
                <span className="font-medium">{describe.name}</span>
                <span className="text-muted-foreground">Needs: {describe.needs.length ? describe.needs.join(", ") : "nothing, a good starting point"}</span>
                <span className="text-muted-foreground">Unlocks: {describe.unlocks.length ? describe.unlocks.join(", ") : "nothing further"}</span>
              </>
            ) : (
              <span className="text-muted-foreground">Hover or focus a topic to trace what it needs and what it unlocks. Dashed topics build on something you have not started.</span>
            )}
          </div>

          <div className="overflow-x-auto rounded-xl border border-border bg-canvas-alt p-4" tabIndex={0} aria-label="Topic map, scrollable">
            <div className="relative" style={{ width, height }}>
              {/* Column headers */}
              {course.modules.map((m, mi) => (
                <div key={m} className="absolute top-0" style={{ left: mi * (W + GX), width: W }}>
                  <Typography role="eyebrow" tone="subtle">Module {mi + 1}</Typography>
                  <div className="truncate text-sm font-semibold" title={m}>{m}</div>
                </div>
              ))}

              {/* Edges */}
              <svg className="pointer-events-none absolute inset-0" width={width} height={height} aria-hidden>
                {edges.map((e) => {
                  const a = pos[e.from];
                  const b = pos[e.to];
                  if (!a || !b) return null;
                  const same = a.x === b.x;
                  const x1 = a.x + W;
                  const y1 = a.y + H / 2;
                  const x2 = same ? b.x + W : b.x;
                  const y2 = b.y + H / 2;
                  const d = same
                    ? `M${x1} ${y1} C${x1 + 38} ${y1}, ${x2 + 38} ${y2}, ${x2} ${y2}`
                    : `M${x1} ${y1} C${x1 + Math.max(40, (x2 - x1) / 2)} ${y1}, ${x2 - Math.max(40, (x2 - x1) / 2)} ${y2}, ${x2} ${y2}`;
                  const lit = !!hover && (e.from === hover || e.to === hover || (focus!.up.has(e.from) && (focus!.up.has(e.to) || e.to === hover)) || (focus!.down.has(e.to) && (focus!.down.has(e.from) || e.from === hover)));
                  return (
                    <path
                      key={`${e.from}-${e.to}`}
                      d={d}
                      fill="none"
                      strokeWidth={lit ? 2 : 1.25}
                      className={cn("transition-all duration-150", lit ? "text-brand-accent" : hover ? "text-border opacity-30" : "text-border")}
                      stroke="currentColor"
                      strokeLinecap="round"
                    />
                  );
                })}
              </svg>

              {/* Nodes */}
              {topics.map((t) => {
                const s = scores[t.id];
                const p = pos[t.id];
                const lock = locked(t.id);
                const isUp = focus?.up.has(t.id);
                const isDown = focus?.down.has(t.id);
                return (
                  <Link
                    key={t.id}
                    href={`/app/course/${code}/topic/${t.id}`}
                    onMouseEnter={() => setHover(t.id)}
                    onMouseLeave={() => setHover(null)}
                    onFocus={() => setHover(t.id)}
                    onBlur={() => setHover(null)}
                    className={cn(
                      "group absolute flex flex-col justify-between rounded-lg border bg-card p-2.5 text-left transition-all duration-150 hover:shadow-sm",
                      lock ? "border-dashed border-border" : "border-border",
                      isUp && "border-foreground/50 bg-surface-brand",
                      isDown && "border-brand-accent/60 bg-surface-brand",
                      hover === t.id && "border-brand-accent ring-2 ring-brand-accent/30",
                      !inFocus(t.id) && "opacity-35",
                    )}
                    style={{ left: p.x, top: p.y, width: W, height: H }}
                    title={lock ? `Builds on: ${prereqsOf(t.id).filter((x) => !scores[x]?.started).map(nameOf).join(", ")}` : undefined}
                  >
                    <div className="flex items-start gap-1.5">
                      <span className="line-clamp-2 text-[0.8125rem] leading-snug font-medium">{nameOf(t.id)}</span>
                      {lock && <Lock className="mt-0.5 size-3 shrink-0 text-subtle-foreground" aria-label="Builds on topics you have not started" />}
                      {t.isNew && <Badge className="ml-auto h-4 shrink-0 px-1.5 text-[0.625rem]">Ny</Badge>}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
                        <div className={cn("h-full rounded-full", masteryBarClass(s?.mastery ?? 0, !!s?.started))} style={{ width: `${s?.mastery ?? 0}%` }} />
                      </div>
                      <span className="text-[0.6875rem] text-subtle-foreground tabular-nums">
                        {s?.status === "overdue" || s?.status === "due" ? <span className="font-medium text-destructive">{dueLabel(s)}</span> : t.exercises ? `${t.exercises} uppg.` : "ny"}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-5">
          {course.modules.map((m, mi) => (
            <section key={m} className="rounded-xl border border-border bg-card">
              <div className="border-b border-border-subtle px-4 py-3">
                <Typography role="eyebrow" tone="subtle">Module {mi + 1}</Typography>
                <Typography role="card-title" as="h2">{m}</Typography>
              </div>
              <ul>
                {rows[mi].map((id) => {
                  const s = scores[id];
                  const lock = locked(id);
                  const t = topics.find((x) => x.id === id)!;
                  return (
                    <li key={id} className="border-t border-border-subtle first:border-t-0">
                      <Link href={`/app/course/${code}/topic/${id}`} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="truncate text-sm font-medium">{nameOf(id)}</span>
                            {lock && <Lock className="size-3 shrink-0 text-subtle-foreground" aria-label="Builds on topics you have not started" />}
                            {t.isNew && <Badge className="h-4 px-1.5 text-[0.625rem]">Ny</Badge>}
                          </div>
                          <Typography role="caption" tone={s?.status === "overdue" ? "destructive" : "subtle"}>
                            {t.exercises ? `${t.exercises} exercises · ` : ""}{s ? dueLabel(s) : "Not started"}
                          </Typography>
                        </div>
                        <MasteryBadge state={masteryState(s)} />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
