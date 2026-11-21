"use client";

import { Check, ChevronRight, Lightbulb, Plus, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Rich } from "@/components/rich";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Typography } from "@/components/ui/typography";
import { masteryState, useStudy, type SolvedStatus } from "@/lib/study";
import { cn } from "@/lib/utils";
import { getCourse, getExam, type SubExercise } from "@/mock";

import { useAi, useAiScope } from "./ai-context";

const dot: Record<ReturnType<typeof masteryState>, string> = {
  "not-started": "bg-level-unrated",
  learning: "bg-level-hard",
  practicing: "bg-level-medium",
  mastered: "bg-level-easy",
};

type Filter = "all" | "open" | "weak";

export function ExamView({ code, examId }: { code: string; examId: string }) {
  const { ready, state, scores, nameOf, actions } = useStudy();
  const { ask } = useAi();
  const course = getCourse(code)!;
  const exam = getExam(examId)!;
  const [filter, setFilter] = useState<Filter>("all");
  const [hints, setHints] = useState<Record<string, number>>({});
  const [shown, setShown] = useState<Record<string, boolean>>({});

  useAiScope({ label: `${exam.title} · ${course.code}`, course: course.code });
  useEffect(() => {
    if (ready && state && state.course !== code) actions.setCourse(code);
  }, [ready, state, code, actions]);

  const all = useMemo(() => exam.exercises.flatMap((e) => e.subs), [exam]);

  if (!ready || !state) {
    return (
      <div className="space-y-4" aria-busy>
        <Skeleton className="h-10 w-80" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const accepted = state.accepted.filter((a) => a.course === code);
  const open = exam.proposals.filter((p) => !state.rejected.includes(p.id) && !accepted.some((a) => a.id === p.id));
  const topicsOfSub = (sub: SubExercise) => [
    ...sub.topics,
    ...accepted.filter((a) => exam.proposals.find((p) => p.id === a.id)?.subs.includes(sub.id)).map((a) => a.id),
  ];

  const solvedCount = all.filter((s) => state.solved[s.id] === "solved").length;
  const keep = (sub: SubExercise) => {
    const st = state.solved[sub.id];
    return filter === "all" ? true : filter === "open" ? !st : st === "stuck" || st === "unsure";
  };

  const assess = (sub: SubExercise, status: SolvedStatus | null) => {
    const ts = topicsOfSub(sub);
    actions.setSolved(code, sub.id, ts, status);
    if (status) toast(status === "solved" ? "Nice. Counted toward mastery" : status === "unsure" ? "Noted. Counts half" : "Noted. We will bring these topics back", { description: ts.map(nameOf).join(" · ") });
  };

  return (
    <div className="space-y-6">
      <nav className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link href={`/app/course/${code}/exams`} className="hover:text-foreground">{course.code} exams</Link>
        <ChevronRight className="size-3.5" />
        <span>{exam.title}</span>
      </nav>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <Typography role="eyebrow">{exam.date}</Typography>
          <Typography role="display-lg" as="h1">{exam.title}</Typography>
          <Typography role="body-sm" tone="muted">
            {exam.exercises.length} exercises · {all.length} parts · {solvedCount}/{all.length} solved
          </Typography>
          <Badge variant="outline" className="mt-1 text-muted-foreground">Example exam, not a real KTH exam</Badge>
        </div>
        <ToggleGroup type="single" value={filter} onValueChange={(v) => v && setFilter(v as Filter)} variant="outline" aria-label="Filter parts">
          <ToggleGroupItem value="all">All</ToggleGroupItem>
          <ToggleGroupItem value="open">Not done</ToggleGroupItem>
          <ToggleGroupItem value="weak">Stuck / unsure</ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* The graph growing: AI proposes a topic, the learner decides. */}
      {open.map((p) => (
        <Card key={p.id} className="border-brand-accent/40 bg-surface-brand">
          <CardHeader>
            <div className="flex items-center gap-2"><Sparkles className="size-4 text-brand-accent" /><Typography role="eyebrow">New topic suggested</Typography></div>
            <CardTitle>{p.name}</CardTitle>
            <CardDescription>{p.reason}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Typography role="body-sm" tone="muted">
              Would sit under <strong className="font-medium text-foreground">{nameOf(p.parent)}</strong> in module {p.module + 1}. Carries {p.subs.length} part{p.subs.length > 1 ? "s" : ""} of this exam.
            </Typography>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => {
                  actions.acceptProposal(p, code);
                  toast.success(`Added “${p.name}” to the map`, { action: { label: "Undo", onClick: () => actions.undoProposal(p.id) } });
                }}
              >
                <Plus /> Add to map
              </Button>
              <Button variant="outline" onClick={() => { actions.rejectProposal(p.id); toast("Dismissed", { action: { label: "Undo", onClick: () => actions.undoProposal(p.id) } }); }}>Not now</Button>
            </div>
          </CardContent>
        </Card>
      ))}

      <Accordion type="multiple" defaultValue={[exam.exercises[0].id]} className="space-y-3">
        {exam.exercises.map((ex) => {
          const subs = ex.subs.filter(keep);
          const doneN = ex.subs.filter((s) => state.solved[s.id] === "solved").length;
          if (subs.length === 0) return null;
          return (
            <AccordionItem key={ex.id} value={ex.id} className="rounded-xl border border-border bg-card px-4 data-open:bg-card">
              <AccordionTrigger className="py-4 hover:no-underline">
                <div className="flex flex-1 flex-wrap items-center gap-x-3 gap-y-1 pr-2 text-left">
                  <span className="type-card-title">Uppgift {ex.number}</span>
                  <span className="text-sm text-muted-foreground">{ex.title}</span>
                  <span className="ml-auto flex items-center gap-2 text-xs text-subtle-foreground tabular-nums">
                    {ex.points} p · {doneN}/{ex.subs.length}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-3 pb-4">
                {ex.intro && <Typography role="body"><Rich text={ex.intro} /></Typography>}
                {subs.map((sub) => {
                  const st = state.solved[sub.id];
                  const nh = hints[sub.id] ?? 0;
                  const topicIds = topicsOfSub(sub);
                  const pending = open.filter((p) => p.subs.includes(sub.id));
                  return (
                    <div key={sub.id} className={cn("rounded-xl border p-4", st === "solved" ? "border-level-easy-border bg-level-easy-muted/40" : "border-border-subtle bg-background")}>
                      <div className="flex items-start gap-3">
                        <span className="grid size-7 shrink-0 place-items-center rounded-md bg-muted text-sm font-semibold">{sub.label}</span>
                        <div className="min-w-0 flex-1 space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <Typography role="body"><Rich text={sub.text} /></Typography>
                            <span className="shrink-0 text-xs text-subtle-foreground tabular-nums">{sub.points} p</span>
                          </div>

                          <div className="flex flex-wrap gap-1.5">
                            {topicIds.map((id) => (
                              <Link
                                key={id}
                                href={`/app/course/${code}/topic/${id}`}
                                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium hover:border-brand-accent hover:text-brand-accent"
                              >
                                <span className={cn("size-2 rounded-full", dot[masteryState(scores[id])])} aria-hidden />
                                {nameOf(id)}
                                {accepted.some((a) => a.id === id) && <Badge className="h-4 px-1 text-[0.625rem]">Ny</Badge>}
                              </Link>
                            ))}
                            {pending.map((p) => (
                              <span key={p.id} className="inline-flex items-center gap-1 rounded-full border border-dashed border-brand-accent/60 px-2.5 py-1 text-xs text-brand-accent">
                                <Sparkles className="size-3" /> {p.name} (AI suggestion)
                              </span>
                            ))}
                          </div>

                          {nh > 0 && (
                            <ol className="space-y-1.5 rounded-lg bg-muted px-3 py-2 text-sm">
                              {sub.hints.slice(0, nh).map((h, i) => (
                                <li key={i} className="flex gap-2"><Lightbulb className="mt-0.5 size-4 shrink-0 text-muted-foreground" /><Rich text={h} /></li>
                              ))}
                            </ol>
                          )}
                          {shown[sub.id] && (
                            <div className="rounded-lg border border-border bg-card px-3 py-2 text-sm"><span className="type-eyebrow mr-2 text-subtle-foreground">Svar</span><Rich text={sub.answer} /></div>
                          )}

                          <div className="flex flex-wrap items-center gap-2">
                            {nh < sub.hints.length && (
                              <Button size="sm" variant="outline" onClick={() => setHints((h) => ({ ...h, [sub.id]: nh + 1 }))}>
                                <Lightbulb /> Hint {nh + 1}
                              </Button>
                            )}
                            {!shown[sub.id] && (
                              <Button size="sm" variant="ghost" onClick={() => setShown((s) => ({ ...s, [sub.id]: true }))}>
                                {nh >= sub.hints.length ? "Show answer" : "Skip to answer"}
                              </Button>
                            )}
                            <Button size="sm" variant="ghost" onClick={() => ask(`Hjälp mig komma vidare med: ${sub.text}`, { label: `${nameOf(sub.topics[0])} · ${course.code}`, topicId: sub.topics[0], course: course.code })}>
                              <Sparkles className="text-brand-accent" /> Ask AI
                            </Button>
                            <ToggleGroup
                              type="single"
                              size="sm"
                              variant="outline"
                              value={st ?? ""}
                              onValueChange={(v) => assess(sub, (v || null) as SolvedStatus | null)}
                              className="ml-auto"
                              aria-label={`How did part ${sub.label} go?`}
                            >
                              <ToggleGroupItem value="solved"><Check className="size-3.5" /> Solved</ToggleGroupItem>
                              <ToggleGroupItem value="unsure">Unsure</ToggleGroupItem>
                              <ToggleGroupItem value="stuck"><X className="size-3.5" /> Stuck</ToggleGroupItem>
                            </ToggleGroup>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
