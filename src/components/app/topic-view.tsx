"use client";

import { ArrowRight, Check, ChevronRight, Lock, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { MasteryBadge } from "@/components/mastery-badge";
import { Formula, Rich } from "@/components/rich";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Typography } from "@/components/ui/typography";
import { dueLabel, edgesOf, masteryState, topicsOf, useStudy } from "@/lib/study";
import { courses, getContent, getCourse } from "@/mock";
import { cn } from "@/lib/utils";

import { useAi, useAiScope } from "./ai-context";
import { PracticeSession } from "./practice-session";

type Mode = "theory" | "practice";

const STEPS = [
  "Reading the exam exercises",
  "Finding what they have in common",
  "Drafting theory and formulas",
  "Writing practice questions",
  "Checking the math",
];

/** The AI-native moment: content does not exist until it is asked for. */
function GenerateCard({ name, exercises, onDone }: { name: string; exercises: number; onDone: () => void }) {
  const [step, setStep] = useState(-1);

  useEffect(() => {
    if (step < 0) return;
    if (step >= STEPS.length) {
      const t = setTimeout(onDone, 350);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setStep((s) => s + 1), 750);
    return () => clearTimeout(t);
  }, [step, onDone]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Not written yet</CardTitle>
        <CardDescription>
          {exercises > 0
            ? `${name} appears in ${exercises} exam exercises. The AI writes the theory and practice questions from them.`
            : `${name} was just added to the map. The AI writes theory and practice questions when you ask.`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {step < 0 ? (
          <Button size="touch" onClick={() => setStep(0)}>
            <Sparkles /> Generate with AI
          </Button>
        ) : (
          <ol className="space-y-2" aria-live="polite">
            {STEPS.map((s, i) => (
              <li key={s} className={cn("flex items-center gap-2 text-sm", i > step && "text-disabled-foreground")}>
                <span className="grid size-5 place-items-center">
                  {i < step ? <Check className="size-4 text-level-easy-foreground" /> : i === step ? <span className="size-3 animate-spin rounded-full border-2 border-foreground/30 border-t-foreground" /> : <span className="size-1.5 rounded-full bg-current" />}
                </span>
                {s}
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}

export function TopicView({ code, topicId }: { code: string; topicId: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const { ready, state, scores, nameOf, actions } = useStudy();
  const { ask } = useAi();
  const course = getCourse(code)!;
  const [mode, setMode] = useState<Mode>(params.get("mode") === "practice" ? "practice" : "theory");

  const name = nameOf(topicId);
  useAiScope({ label: `${name} · ${course.code}`, topicId, course: course.code });

  useEffect(() => {
    if (ready && state && state.course !== code) actions.setCourse(code);
  }, [ready, state, code, actions]);

  const accepted = useMemo(() => state?.accepted ?? [], [state]);
  const topics = useMemo(() => topicsOf(code, accepted), [code, accepted]);
  const edges = useMemo(() => edgesOf(code, accepted), [code, accepted]);
  const entry = topics.find((t) => t.id === topicId);
  const content = getContent(topicId);

  const switchMode = (m: Mode) => {
    setMode(m);
    window.history.replaceState(null, "", m === "practice" ? `?mode=practice` : window.location.pathname);
  };

  if (!ready || !state) {
    return (
      <div className="space-y-4" aria-busy>
        <Skeleton className="h-6 w-64" />
        <Skeleton className="h-10 w-96" />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  const s = scores[topicId];
  const prereqs = edges.filter((e) => e.to === topicId).map((e) => e.from);
  const unlocks = edges.filter((e) => e.from === topicId).map((e) => e.to);
  const unmet = prereqs.filter((p) => !scores[p]?.started);
  const generated = state.generated.includes(topicId);
  const alsoIn = courses.filter((c) => c.code !== code && c.topics.some((t) => t.topicId === topicId));
  const nextTopic = unlocks.find((u) => !scores[u]?.started) ?? unlocks[0];
  const moduleName = entry ? course.modules[entry.module] : "";
  const href = (id: string) => `/app/course/${code}/topic/${id}`;

  const markRead = () => {
    const id = `read:${topicId}:${Date.now()}`;
    actions.record({ id, course: code, topic: topicId, kind: "theory", min: content?.minutes ?? 8 });
    toast.success("Marked as read", {
      description: "Test yourself while it is fresh.",
      action: { label: "Undo", onClick: () => actions.remove(id) },
    });
    switchMode("practice");
  };

  return (
    <div className="space-y-6">
      <nav className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link href={`/app/course/${code}`} className="hover:text-foreground">{course.code}</Link>
        <ChevronRight className="size-3.5" />
        <span className="truncate">{moduleName}</span>
      </nav>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="max-w-2xl space-y-2">
          <Typography role="display-lg" as="h1">{name}</Typography>
          {content && <Typography role="body-lg" tone="muted">{content.blurb}</Typography>}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <MasteryBadge state={masteryState(s)} />
            {s?.started && <Typography role="caption" tone={s.status === "overdue" ? "destructive" : "subtle"}>{dueLabel(s)}</Typography>}
            {entry && entry.exercises > 0 && <Typography role="caption" tone="subtle">· {entry.exercises} exam exercises</Typography>}
            {entry?.isNew && <Badge>Ny</Badge>}
          </div>
        </div>
        {(content || generated) && (
          <ToggleGroup type="single" value={mode} onValueChange={(v) => v && switchMode(v as Mode)} variant="outline" aria-label="Mode">
            <ToggleGroupItem value="theory">Theory</ToggleGroupItem>
            <ToggleGroupItem value="practice">Practice</ToggleGroupItem>
          </ToggleGroup>
        )}
      </div>

      {unmet.length > 0 && !s?.started && (
        <p className="rounded-xl border border-dashed border-border bg-card px-4 py-3 text-sm text-muted-foreground">
          <Lock className="mr-2 inline size-4 align-text-bottom text-subtle-foreground" />
          This builds on{" "}
          {unmet.map((p, i) => (
            <span key={p}>
              {i > 0 && ", "}
              <Link href={href(p)} className="font-medium text-foreground underline-offset-4 hover:text-brand-accent hover:underline">{nameOf(p)}</Link>
            </span>
          ))}
          , which you have not started. You can continue anyway.
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_17rem]">
        <div className="min-w-0 space-y-6">
          {!content && !generated && (
            <GenerateCard
              name={name}
              exercises={entry?.exercises ?? 0}
              onDone={() => {
                actions.markGenerated(topicId);
                toast.success("Draft ready", { description: "Prototype: real content will be written from your exams." });
              }}
            />
          )}

          {!content && generated && (
            <Card>
              <CardHeader>
                <Badge variant="outline" className="w-fit">Draft (prototype)</Badge>
                <CardTitle className="mt-2">Översikt</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Typography role="reading">
                  <Rich
                    text={
                      entry && entry.exercises > 0
                        ? `**${name}** förekommer i ${entry.exercises} tentauppgifter i kursen. Här skriver AI:n en genomgång av idén, de viktigaste definitionerna och de lösningsmetoder som uppgifterna kräver.`
                        : `**${name}** föreslogs av AI:n utifrån tentauppgifter där inget befintligt ämne passade. Här skriver AI:n en genomgång av idén, de viktigaste definitionerna och de lösningsmetoder som uppgifterna kräver.`
                    }
                  />
                </Typography>
                <Typography role="body-sm" tone="muted">
                  This is placeholder text. In the real product the draft is written from the extracted exercises and their solutions, with every claim linked to the exercises it came from.
                </Typography>
              </CardContent>
            </Card>
          )}

          {content && mode === "theory" && (
            <>
              <article className="space-y-3 rounded-2xl border border-border bg-card p-5 md:p-7">
                {content.theory.map((b, i) =>
                  b.t === "h" ? (
                    <h2 key={i} className="type-section-title pt-3 first:pt-0">{b.text}</h2>
                  ) : b.t === "p" ? (
                    <Typography key={i} role="reading" as="p"><Rich text={b.text} /></Typography>
                  ) : b.t === "list" ? (
                    <ul key={i} className="type-reading list-disc space-y-1.5 pl-5">
                      {b.items.map((it, j) => <li key={j}><Rich text={it} /></li>)}
                    </ul>
                  ) : (
                    <Formula key={i} tex={b.tex} />
                  ),
                )}
              </article>

              <Card>
                <CardHeader><CardTitle>Formulas</CardTitle></CardHeader>
                <CardContent className="space-y-1 rounded-b-xl">
                  {content.formulas.map((f, i) => <Formula key={i} tex={f} />)}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Remember</CardTitle></CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {content.takeaways.map((t, i) => (
                      <li key={i} className="flex gap-2 text-sm"><Check className="mt-0.5 size-4 shrink-0 text-muted-foreground" /><Rich text={t} /></li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <div className="sticky bottom-20 z-10 flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-card/95 p-3 shadow-sm backdrop-blur md:bottom-4">
                <Button size="touch" onClick={markRead}>I have read this</Button>
                <Button size="touch" variant="outline" onClick={() => switchMode("practice")}>Skip to practice</Button>
                <Button variant="ghost" className="ml-auto" onClick={() => ask("Förklara det här enklare")}><Sparkles className="text-brand-accent" /> Explain simpler</Button>
              </div>
            </>
          )}

          {content && mode === "practice" && (
            <PracticeSession
              key={topicId}
              course={code}
              topicId={topicId}
              topicName={name}
              questions={content.questions}
              minutes={content.minutes}
              next={nextTopic ? { id: href(nextTopic), name: nameOf(nextTopic) } : null}
              onBackToTheory={() => switchMode("theory")}
            />
          )}

          {!content && generated && mode === "practice" && (
            <Typography role="body-sm" tone="muted">Practice questions arrive with the full draft.</Typography>
          )}
        </div>

        <aside className="space-y-4">
          {alsoIn.length > 0 && (
            <div className="rounded-xl border border-border-subtle bg-card p-3">
              <Typography role="eyebrow" tone="subtle">Shared topic</Typography>
              <Typography role="body-sm" tone="muted" className="mt-1">
                Also in {alsoIn.map((c) => `${c.code} (${c.schoolShort})`).join(", ")}. Your progress here counts there too.
              </Typography>
            </div>
          )}

          {prereqs.length > 0 && (
            <div className="space-y-2">
              <Typography role="eyebrow" tone="subtle">Builds on</Typography>
              <div className="flex flex-col gap-1.5">
                {prereqs.map((p) => (
                  <Link key={p} href={href(p)} className="flex items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm hover:bg-muted">
                    <span className="truncate">{nameOf(p)}</span>
                    <MasteryBadge state={masteryState(scores[p])} />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {unlocks.length > 0 && (
            <div className="space-y-2">
              <Typography role="eyebrow" tone="subtle">Unlocks</Typography>
              <div className="flex flex-col gap-1.5">
                {unlocks.map((u) => (
                  <Link key={u} href={href(u)} className="flex items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm hover:bg-muted">
                    <span className="truncate">{nameOf(u)}</span>
                    <ArrowRight className="size-3.5 shrink-0 text-muted-foreground" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Typography role="eyebrow" tone="subtle">My notes</Typography>
            <Textarea
              key={topicId}
              defaultValue={state.notes[topicId] ?? ""}
              onBlur={(e) => actions.saveNote(topicId, e.target.value)}
              placeholder="Write something you want to remember."
              rows={4}
              aria-label="My notes"
            />
          </div>

          <Button variant="outline" className="w-full" onClick={() => router.push(`/app/course/${code}`)}>Back to map</Button>
        </aside>
      </div>
    </div>
  );
}
