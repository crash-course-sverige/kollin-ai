"use client";

import { ArrowRight, Check, RotateCcw, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { Rich } from "@/components/rich";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { Typography } from "@/components/ui/typography";
import { computeScores, dueLabel, useStudy } from "@/lib/study";
import { cn } from "@/lib/utils";
import type { Question } from "@/mock";

import { useAi } from "./ai-context";

/** Fisher-Yates with a throwaway RNG. Runs once per session, client side only. */
function shuffled(n: number) {
  const a = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type Props = {
  course: string;
  topicId: string;
  topicName: string;
  questions: Question[];
  minutes: number;
  /** Where "next" should send the learner after the session. */
  next?: { id: string; name: string } | null;
  onBackToTheory: () => void;
};

export function PracticeSession({ course, topicId, topicName, questions, minutes, next, onBackToTheory }: Props) {
  const { state, scores, actions } = useStudy();
  const { ask } = useAi();
  const [run, setRun] = useState(0); // bump to restart with a fresh shuffle
  const order = useMemo(() => questions.map((q) => shuffled(q.options.length)), [questions, run]); // eslint-disable-line react-hooks/exhaustive-deps
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null); // display index
  const [results, setResults] = useState<boolean[]>([]);
  const [finished, setFinished] = useState(false);
  // Mastery when the session started; must not follow the live value once we save.
  const [before, setBefore] = useState(() => scores[topicId]?.mastery ?? 0);
  const saved = useRef<string | null>(null);

  // Done only after the learner has seen the last explanation and pressed Finish.
  const done = finished;
  const q = questions[i];
  const opts = q ? order[i].map((orig) => ({ orig, text: q.options[orig] })) : [];
  const revealed = picked !== null;
  const correctDisplay = q ? order[i].indexOf(q.answer) : -1;

  const choose = useCallback(
    (displayIndex: number) => {
      if (done || picked !== null) return;
      setPicked(displayIndex);
      setResults((r) => [...r, order[i][displayIndex] === questions[i].answer]);
    },
    [done, picked, order, i, questions],
  );

  const advance = useCallback(() => {
    if (picked === null) return;
    if (i === questions.length - 1) {
      setFinished(true);
      return;
    }
    setPicked(null);
    setI((x) => x + 1);
  }, [picked, i, questions.length]);

  // Keyboard: 1-4 answers, Enter / Space / → continue.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "TEXTAREA" || tag === "INPUT") return;
      if (!done && picked === null && /^[1-9]$/.test(e.key)) {
        const n = Number(e.key) - 1;
        if (n < opts.length) choose(n);
      } else if (!done && picked !== null && (e.key === "Enter" || e.key === " " || e.key === "ArrowRight")) {
        e.preventDefault();
        advance();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [done, picked, opts.length, choose, advance]);

  // Persist once, when the last answer is in. Guarded so re-renders never double-save.
  const correct = results.filter(Boolean).length;
  useEffect(() => {
    if (!done || !state) return;
    const key = `${run}`;
    if (saved.current === key) return;
    saved.current = key;
    actions.record({
      id: `practice:${topicId}:${Date.now()}`,
      course,
      topic: topicId,
      kind: "practice",
      min: Math.max(3, Math.round(minutes / 2)),
      correct,
      total: questions.length,
      wrong: results.flatMap((r, idx) => (r ? [] : [idx])),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  const after = useMemo(() => {
    if (!done || !state) return null;
    return computeScores(state.sessions, [topicId])[topicId];
  }, [done, state, topicId]);

  const restart = () => {
    setBefore(scores[topicId]?.mastery ?? 0);
    setRun((r) => r + 1);
    setI(0);
    setPicked(null);
    setResults([]);
    setFinished(false);
    saved.current = null;
  };

  /* ---------------- summary ---------------- */
  if (done) {
    const pct = Math.round((correct / questions.length) * 100);
    const wrongIdx = results.flatMap((r, idx) => (r ? [] : [idx]));
    return (
      <div className="space-y-5">
        <div className="rounded-2xl border border-border bg-card p-6 text-center">
          <Typography role="eyebrow">Session complete</Typography>
          <Typography role="stat" as="p" className="mt-2">{correct}/{questions.length}</Typography>
          <Typography role="body-sm" tone="muted" className="mt-1">
            {pct >= 80 ? "Strong. The next review moves further out." : pct >= 50 ? "Getting there. A review is scheduled soon." : "Worth another look at the theory. A review comes back in a few days."}
          </Typography>
          {after && (
            <div className="mx-auto mt-5 grid max-w-sm grid-cols-2 gap-3 text-left">
              <div className="rounded-lg bg-muted px-3 py-2">
                <Typography role="caption" tone="subtle">Mastery</Typography>
                <div className="type-card-title tabular-nums">{before}% → {after.mastery}%</div>
              </div>
              <div className="rounded-lg bg-muted px-3 py-2">
                <Typography role="caption" tone="subtle">Next review</Typography>
                <div className="type-card-title">{dueLabel(after).replace("Review ", "")}</div>
              </div>
            </div>
          )}
        </div>

        {wrongIdx.length > 0 && (
          <div className="space-y-2">
            <Typography role="card-title" as="h3">To revisit</Typography>
            {wrongIdx.map((idx) => (
              <div key={idx} className="rounded-xl border border-border bg-card p-4">
                <Typography role="body-sm"><Rich text={questions[idx].q} /></Typography>
                <Typography role="body-sm" tone="muted" className="mt-2"><Rich text={`**Svar:** ${questions[idx].options[questions[idx].answer]}`} /></Typography>
                <Typography role="body-sm" tone="muted" className="mt-1"><Rich text={questions[idx].explain} /></Typography>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => ask(`Förklara varför svaret är "${questions[idx].options[questions[idx].answer]}": ${questions[idx].q}`)}
                >
                  <Sparkles className="text-brand-accent" /> Explain with AI
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {next && (
            <Button asChild size="touch"><Link href={next.id}>Next: {next.name} <ArrowRight /></Link></Button>
          )}
          <Button variant="outline" size="touch" onClick={onBackToTheory}>Back to theory</Button>
          <Button variant="ghost" size="touch" onClick={restart}><RotateCcw /> Again</Button>
        </div>
      </div>
    );
  }

  /* ---------------- question ---------------- */
  const ok = revealed && results[results.length - 1];

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="flex flex-1 gap-1.5" role="progressbar" aria-valuenow={i + (revealed ? 1 : 0)} aria-valuemin={0} aria-valuemax={questions.length} aria-label="Progress">
          {questions.map((_, idx) => (
            <span
              key={idx}
              className={cn(
                "h-1.5 flex-1 rounded-full bg-muted transition-colors",
                results[idx] === true && "bg-level-easy",
                results[idx] === false && "bg-level-hard",
                idx === i && results[idx] === undefined && "bg-foreground/40",
              )}
            />
          ))}
        </div>
        <Typography role="caption" tone="subtle" className="tabular-nums">{i + 1}/{questions.length}</Typography>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
        <Typography role="eyebrow" tone="subtle">{topicName}</Typography>
        <Typography role="body-lg" className="mt-2 font-medium"><Rich text={q.q} /></Typography>

        <div className="mt-5 grid gap-2" role="radiogroup" aria-label="Answers">
          {opts.map((o, di) => {
            const isPicked = picked === di;
            const isCorrect = di === correctDisplay;
            return (
              <button
                key={o.orig}
                role="radio"
                aria-checked={isPicked}
                disabled={revealed}
                onClick={() => choose(di)}
                className={cn(
                  "flex min-h-touch items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm transition-colors",
                  !revealed && "border-border hover:border-foreground/40 hover:bg-muted",
                  revealed && isCorrect && "border-level-easy-border bg-level-easy-muted text-level-easy-foreground",
                  revealed && isPicked && !isCorrect && "border-level-hard-border bg-level-hard-muted text-level-hard-foreground",
                  revealed && !isCorrect && !isPicked && "border-border opacity-50",
                )}
              >
                <span className={cn("grid size-6 shrink-0 place-items-center rounded-md border border-current/30 text-xs font-medium tabular-nums")}>
                  {revealed && isCorrect ? <Check className="size-3.5" /> : revealed && isPicked ? <X className="size-3.5" /> : di + 1}
                </span>
                <span className="flex-1"><Rich text={o.text} /></span>
              </button>
            );
          })}
        </div>

        {revealed && (
          <div className={cn("mt-4 rounded-xl border p-4", ok ? "border-level-easy-border bg-level-easy-muted" : "border-level-hard-border bg-level-hard-muted")} aria-live="polite">
            <div className={cn("type-card-title", ok ? "text-level-easy-foreground" : "text-level-hard-foreground")}>{ok ? "Rätt" : "Inte riktigt"}</div>
            <Typography role="body-sm" className="mt-1"><Rich text={q.explain} /></Typography>
            {!ok && (
              <Button variant="outline" size="sm" className="mt-3 bg-card" onClick={() => ask(`Förklara varför svaret är "${q.options[q.answer]}": ${q.q}`)}>
                <Sparkles className="text-brand-accent" /> Explain with AI
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-3">
        <Typography role="caption" tone="subtle" className="hidden sm:block">
          {revealed ? <><Kbd>Enter</Kbd> continue</> : <>Press <Kbd>1</Kbd>–<Kbd>{opts.length}</Kbd> to answer</>}
        </Typography>
        <Button size="touch" className="ml-auto" disabled={!revealed} onClick={advance}>
          {i === questions.length - 1 ? "Finish" : "Continue"} <ArrowRight />
        </Button>
      </div>
    </div>
  );
}

export function toastSaved(message: string, action?: { label: string; onClick: () => void }) {
  toast.success(message, action ? { action } : undefined);
}
