"use client";

import { ArrowRight, CalendarClock, Play } from "lucide-react";
import Link from "next/link";

import { MasteryBadge, masteryBarClass } from "@/components/mastery-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Typography } from "@/components/ui/typography";
import { addDays, diffDays, dkey, dueLabel, edgesOf, masteryState, recommend, today, topicsOf, useStudy } from "@/lib/study";
import { cn } from "@/lib/utils";

function streakOf(sessions: { at: string }[]) {
  const days = new Set(sessions.map((s) => dkey(new Date(s.at))));
  let d = today();
  if (!days.has(d)) d = addDays(d, -1); // today not studied yet: streak is still alive until midnight
  let n = 0;
  while (days.has(d)) {
    n++;
    d = addDays(d, -1);
  }
  return n;
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3">
      <Typography role="stat" as="p">{value}</Typography>
      <Typography role="caption" tone="subtle">{label}</Typography>
    </div>
  );
}

export function Dashboard() {
  const { ready, state, course, scores, nameOf } = useStudy();

  if (!ready || !state) {
    return (
      <div className="space-y-6" aria-busy>
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-36 w-full" />
        <div className="grid gap-3 sm:grid-cols-4"><Skeleton className="h-20" /><Skeleton className="h-20" /><Skeleton className="h-20" /><Skeleton className="h-20" /></div>
      </div>
    );
  }

  const topics = topicsOf(course.code, state.accepted);
  const ids = topics.map((t) => t.id);
  const edges = edgesOf(course.code, state.accepted);
  const due = ids.filter((id) => scores[id]?.status === "due" || scores[id]?.status === "overdue").sort((a, b) => (scores[a].days ?? 0) - (scores[b].days ?? 0));
  const recs = recommend(ids, edges, scores, nameOf).slice(0, 5);
  const mastered = ids.filter((id) => masteryState(scores[id]) === "mastered").length;
  const started = ids.filter((id) => scores[id]?.started).length;
  const weekAgo = addDays(today(), -6);
  const minutes = state.sessions.filter((s) => dkey(new Date(s.at)) >= weekAgo).reduce((a, s) => a + s.min, 0);
  const daysToExam = diffDays(today(), course.examDate);
  const nextNew = recs.find((r) => r.kind === "theory");
  const sessionMin = Math.min(25, due.slice(0, 3).length * 6 + (nextNew ? 12 : 0));
  const firstId = due[0] ?? recs[0]?.topic;
  const href = (id: string, mode?: "practice") => `/app/course/${course.code}/topic/${id}${mode ? "?mode=practice" : ""}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <Typography role="eyebrow">{new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}</Typography>
          <Typography role="display-lg" as="h1">{course.name}</Typography>
          <Typography role="body-sm" tone="muted">{course.code} · {course.school}</Typography>
        </div>
        <Badge variant="outline" className="gap-1.5 py-1.5 pr-3 pl-2.5 text-sm">
          <CalendarClock className="size-4" /> Exam in {daysToExam} days
        </Badge>
      </div>

      {/* One decision: what to do right now */}
      <section className="rounded-2xl bg-field-brand p-5 text-on-brand md:p-6" aria-label="Today's session">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <Typography role="eyebrow" tone="on-brand" className="opacity-75">Today’s session</Typography>
            <Typography role="display-lg" as="h2" tone="on-brand">
              {due.length ? `${due.length} to review${nextNew ? " + 1 new topic" : ""}` : nextNew ? "Start something new" : "You are all caught up"}
            </Typography>
            <Typography role="body-sm" tone="on-brand" className="opacity-80">
              {firstId ? `About ${Math.max(sessionMin, 8)} minutes. Starts with ${nameOf(firstId)}.` : "Nothing is due. Browse the topic map for what to do next."}
            </Typography>
          </div>
          {firstId && (
            <Button asChild variant="inverse" size="touch">
              <Link href={href(firstId, due.length ? "practice" : undefined)}>
                <Play className="size-4" /> Start
              </Link>
            </Button>
          )}
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat value={`${streakOf(state.sessions)}`} label="day streak" />
        <Stat value={`${mastered}/${ids.length}`} label="topics mastered" />
        <Stat value={`${started}`} label="topics started" />
        <Stat value={`${minutes}`} label="minutes this week" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Due for review</CardTitle>
            <CardDescription>Spaced reviews keep what you learned from fading.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-0">
            {due.length === 0 && <Typography role="body-sm" tone="muted">Nothing due. Nice.</Typography>}
            {due.map((id) => (
              <div key={id} className="flex items-center gap-3 border-t border-border-subtle py-2.5 first:border-t-0">
                <div className="min-w-0 flex-1">
                  <Link href={href(id)} className="block truncate text-sm font-medium hover:text-brand-accent">{nameOf(id)}</Link>
                  <Typography role="caption" tone={scores[id].status === "overdue" ? "destructive" : "subtle"}>{dueLabel(scores[id])}</Typography>
                </div>
                <Button asChild size="sm"><Link href={href(id, "practice")}>Review</Link></Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recommended next</CardTitle>
            <CardDescription>Chosen from your progress and what each topic builds on.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-0">
            {recs.map((r) => (
              <div key={r.topic + r.kind} className="flex items-center gap-3 border-t border-border-subtle py-2.5 first:border-t-0">
                <div className="min-w-0 flex-1">
                  <Link href={href(r.topic)} className="block truncate text-sm font-medium hover:text-brand-accent">{nameOf(r.topic)}</Link>
                  <Typography role="caption" tone="subtle" className="line-clamp-2">{r.why}</Typography>
                </div>
                <Button asChild size="sm" variant="outline">
                  <Link href={href(r.topic, r.kind === "practice" ? "practice" : undefined)}>{r.kind === "practice" ? "Practice" : "Theory"}</Link>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-end justify-between">
          <div>
            <CardTitle>Progress by module</CardTitle>
            <CardDescription>Based on mastery, not just completion.</CardDescription>
          </div>
          <Button asChild variant="ghost" size="sm"><Link href={`/app/course/${course.code}`}>Topic map <ArrowRight /></Link></Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {course.modules.map((m, mi) => {
            const inModule = topics.filter((t) => t.module === mi);
            const avg = inModule.length ? Math.round(inModule.reduce((a, t) => a + (scores[t.id]?.mastery ?? 0), 0) / inModule.length) : 0;
            const any = inModule.some((t) => scores[t.id]?.started);
            return (
              <div key={m} className="space-y-1.5">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="truncate text-sm font-medium">{m}</span>
                  <span className="shrink-0 text-xs text-muted-foreground tabular-nums">{inModule.filter((t) => scores[t.id]?.started).length}/{inModule.length} started · {avg}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={avg} aria-valuemin={0} aria-valuemax={100} aria-label={`${m} mastery`}>
                  <div className={cn("h-full rounded-full transition-[width] duration-500", masteryBarClass(avg, any))} style={{ width: `${avg}%` }} />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
      <MasteryLegend />
    </div>
  );
}

function MasteryLegend() {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
      Mastery: <MasteryBadge state="not-started" /> <MasteryBadge state="learning" /> <MasteryBadge state="practicing" /> <MasteryBadge state="mastered" />
    </div>
  );
}
