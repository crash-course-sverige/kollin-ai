"use client";

import { ArrowUp, Check, NotebookPen, Plus, RotateCcw } from "lucide-react";
import { motion } from "motion/react";
import { useId, useState, type KeyboardEvent, type ReactNode } from "react";

import { MasteryBadge, masteryBarClass } from "@/components/mastery-badge";
import { Formula, Rich } from "@/components/rich";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { computeScores, dkey, masteryState, type Session } from "@/lib/study";
import { courses } from "@/mock";
import { cn } from "@/lib/utils";

import { moduleTotals } from "./data";

/* -------------------------------------------------------------------------
 * 1. Read your exams: where the points live (real tagging data)
 * ----------------------------------------------------------------------- */

function ExamsDemo() {
  const course = courses[0];
  const mods = moduleTotals(course);
  const max = Math.max(...mods.map((m) => m.exercises));
  const total = mods.reduce((a, m) => a + m.exercises, 0);
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Typography role="eyebrow" tone="subtle">{course.code} · {course.schoolShort}</Typography>
          <Typography role="card-title" as="p" className="mt-1">Where the exam points live</Typography>
        </div>
        <Typography role="caption" tone="subtle">{course.exams} exams · {total} exercise tags</Typography>
      </div>
      <ul className="space-y-3">
        {mods.map((m, i) => (
          <li key={m.name} className="space-y-1.5">
            <div className="flex items-baseline justify-between gap-3">
              <span className="type-body-sm font-medium">{m.name}</span>
              <span className="type-caption text-muted-foreground tabular-nums">{m.exercises}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${(m.exercises / max) * 100}%` }}
                transition={{ duration: 0.7, delay: i * 0.06, ease: "easeOut" }}
              />
            </div>
          </li>
        ))}
      </ul>
      <Typography role="body-sm" tone="muted">
        Every exercise from every past exam is tagged with the topics it tests. Spend your hours where the points are, not where the textbook is longest.
      </Typography>
    </div>
  );
}

/* -------------------------------------------------------------------------
 * 2. Log your steps: the real spaced-review engine, on fixed demo dates
 * ----------------------------------------------------------------------- */

type Entry = { day: number; kind: Session["kind"]; correct?: number; total?: number; min: number };

const BASE = new Date(2026, 2, 2, 12, 0, 0);
const atDay = (d: number) => {
  const x = new Date(BASE);
  x.setDate(x.getDate() + d);
  return x.toISOString();
};
const FIRST: Entry[] = [{ day: 0, kind: "theory", min: 11 }];
const LADDER = [3, 7, 16, 35, 75, 160];

const REVIEWS = [
  { label: "Nailed it", sub: "4/4", correct: 4 },
  { label: "Shaky", sub: "2/4", correct: 2 },
  { label: "Blanked", sub: "0/4", correct: 0 },
];

function LogDemo() {
  const [entries, setEntries] = useState<Entry[]>(FIRST);
  const last = entries[entries.length - 1].day;

  const sessions: Session[] = entries.map((e, i) => ({ id: `e${i}`, course: "SF1624", topic: "det", kind: e.kind, at: atDay(e.day), min: e.min, correct: e.correct, total: e.total }));
  const score = computeScores(sessions, ["det"], dkey(new Date(atDay(last))))["det"];
  const interval = score.days ?? 0;
  const nextDay = last + Math.max(1, interval);

  const log = (correct: number) => {
    if (entries.length >= 9) return;
    setEntries([...entries, { day: nextDay, kind: "practice", correct, total: 4, min: 6 }]);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Typography role="eyebrow" tone="subtle">Determinant</Typography>
          <Typography role="card-title" as="p" className="mt-1">Log a review on its due day</Typography>
        </div>
        <MasteryBadge state={masteryState(score)} />
      </div>

      <div className="grid gap-5 sm:grid-cols-[1fr_11rem]">
        {/* Log */}
        <ol className="max-h-56 space-y-1.5 overflow-y-auto pr-1" aria-label="Study log">
          {entries.map((e, i) => (
            <li key={i} className="flex items-center gap-3 rounded-lg border border-border-subtle bg-background px-3 py-2">
              <span className="type-caption w-12 shrink-0 font-medium text-subtle-foreground tabular-nums">Day {e.day}</span>
              <span className="type-body-sm flex-1">{e.kind === "theory" ? "Read the theory" : "Practice"}</span>
              <span className="type-caption text-muted-foreground tabular-nums">
                {e.kind === "theory" ? `${e.min} min` : `${e.correct}/${e.total}`}
              </span>
            </li>
          ))}
        </ol>

        {/* Result */}
        <div className="space-y-3 rounded-xl bg-surface-brand p-3.5">
          <div>
            <Typography role="caption" tone="subtle">Mastery</Typography>
            <Typography role="stat" as="p" className="tabular-nums">{score.mastery}%</Typography>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
              <div className={cn("h-full rounded-full transition-[width] duration-500", masteryBarClass(score.mastery, true))} style={{ width: `${score.mastery}%` }} />
            </div>
          </div>
          <div>
            <Typography role="caption" tone="subtle">Next review</Typography>
            <Typography role="body-sm" as="p" className="font-medium">in {interval} days · day {nextDay}</Typography>
          </div>
        </div>
      </div>

      {/* Interval ladder */}
      <div>
        <Typography role="caption" tone="subtle">Review ladder (days between reviews)</Typography>
        <ol className="mt-1.5 grid grid-cols-6 gap-1.5" aria-label="Review intervals">
          {LADDER.map((d) => (
            <li
              key={d}
              className={cn(
                "type-caption rounded-md border py-1 text-center tabular-nums transition-colors",
                d === interval ? "border-primary bg-primary font-medium text-primary-foreground" : d < interval ? "border-border-subtle bg-muted text-muted-foreground" : "border-border-subtle text-subtle-foreground",
              )}
            >
              {d}
            </li>
          ))}
        </ol>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {REVIEWS.map((r) => (
          <Button key={r.label} variant="outline" size="lg" disabled={entries.length >= 9} onClick={() => log(r.correct)}>
            {r.label} <span className="text-muted-foreground">{r.sub}</span>
          </Button>
        ))}
        <Button variant="ghost" size="icon-lg" aria-label="Reset the log" onClick={() => setEntries(FIRST)} className="ml-auto">
          <RotateCcw />
        </Button>
      </div>
      <Typography role="body-sm" tone="muted">
        Nail it and the gap grows. Blank and it resets to 3 days. This is the same engine the app runs on.
      </Typography>
    </div>
  );
}

/* -------------------------------------------------------------------------
 * 3. Build your notebook: clip things from anywhere into one page
 * ----------------------------------------------------------------------- */

const CLIPS = [
  { id: "exam", label: "From exam", source: "Exempeltenta · 1b", text: "**Rang** är antalet ledande element i trappstegsform. Här: $\\operatorname{rang}A=2$." },
  { id: "tutor", label: "AI tutor", source: "Tutor answer", text: "$\\det(cA)=c^n\\det A$, inte $c\\det A$. En vanlig fallgrop." },
  { id: "tip", label: "Community", source: "Top tip", text: "Byter du plats på två rader byter determinanten tecken." },
];

function NotebookDemo() {
  const [clipped, setClipped] = useState<string[]>(["tutor"]);
  const toggle = (id: string) => setClipped((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));

  return (
    <div className="grid gap-5 md:grid-cols-[13rem_1fr]">
      <div className="space-y-2">
        <Typography role="eyebrow" tone="subtle">Found while studying</Typography>
        {CLIPS.map((c) => {
          const on = clipped.includes(c.id);
          return (
            <button
              key={c.id}
              onClick={() => toggle(c.id)}
              aria-pressed={on}
              className={cn(
                "flex w-full items-start gap-2 rounded-xl border bg-background p-3 text-left transition-colors hover:bg-muted",
                on ? "border-primary" : "border-border-subtle",
              )}
            >
              <span className="min-w-0 flex-1">
                <span className="type-caption block font-medium text-subtle-foreground">{c.source}</span>
                <span className="type-body-sm mt-0.5 block font-medium">{on ? "In your notebook" : "Clip to notebook"}</span>
              </span>
              <span className={cn("mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border", on ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground")}>
                {on ? <Check className="size-3.5" /> : <Plus className="size-3.5" />}
              </span>
            </button>
          );
        })}
      </div>

      {/* The page */}
      <div className="min-h-72 rounded-xl border border-border-subtle bg-background p-5">
        <div className="flex items-center gap-2 text-subtle-foreground">
          <NotebookPen className="size-4" />
          <span className="type-caption">SF1624 · Determinant</span>
        </div>
        <Typography role="display-lg" as="p" className="mt-2">Determinant</Typography>
        <Formula tex="\det\begin{pmatrix}a&b\\c&d\end{pmatrix}=ad-bc" className="my-2" />
        <div className="space-y-2.5">
          {CLIPS.filter((c) => clipped.includes(c.id)).map((c) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="rounded-xl border border-border-subtle bg-card px-4 pt-2.5 pb-3"
            >
              <span className="type-eyebrow text-brand-accent">{c.label}</span>
              <p className="type-body mt-1"><Rich text={c.text} /></p>
            </motion.div>
          ))}
          {clipped.length === 0 && <Typography role="body-sm" tone="disabled">Clip something from the left to start your page.</Typography>}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------
 * 4. Learn with the community. EXAMPLE DATA: community features are not live.
 * ----------------------------------------------------------------------- */

const DIFFICULTY = [
  { label: "Easy", pct: 54, className: "bg-level-easy" },
  { label: "Medium", pct: 33, className: "bg-level-medium" },
  { label: "Hard", pct: 13, className: "bg-level-hard" },
];

const TIPS = [
  { id: "t1", text: "Utveckla längs raden eller kolonnen med flest nollor.", votes: 42 },
  { id: "t2", text: "Är två rader parallella är determinanten 0. Kolla det först.", votes: 27 },
  { id: "t3", text: "Glöm inte teckenfaktorn $(-1)^{i+j}$ vid kofaktorutveckling.", votes: 19 },
];

function CommunityDemo() {
  const [voted, setVoted] = useState<string[]>([]);
  const toggle = (id: string) => setVoted((v) => (v.includes(id) ? v.filter((x) => x !== id) : [...v, id]));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Typography role="eyebrow" tone="subtle">Exempeltenta · 2a</Typography>
          <Typography role="card-title" as="p" className="mt-1">Beräkna <Rich text="$\det A$" /></Typography>
        </div>
        <Badge variant="outline" className="text-muted-foreground">Example data</Badge>
      </div>

      <div>
        <Typography role="caption" tone="subtle">How students rated it</Typography>
        <div className="mt-1.5 flex h-3 overflow-hidden rounded-full bg-muted" role="img" aria-label={DIFFICULTY.map((d) => `${d.label} ${d.pct}%`).join(", ")}>
          {DIFFICULTY.map((d) => <div key={d.label} className={d.className} style={{ width: `${d.pct}%` }} />)}
        </div>
        <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
          {DIFFICULTY.map((d) => (
            <li key={d.label} className="type-caption flex items-center gap-1.5 text-muted-foreground">
              <span className={cn("size-2 rounded-sm", d.className)} /> {d.label} {d.pct}%
            </li>
          ))}
        </ul>
      </div>

      <div>
        <Typography role="caption" tone="subtle">Tips that helped</Typography>
        <ul className="mt-1.5 space-y-1.5">
          {TIPS.map((t) => {
            const on = voted.includes(t.id);
            return (
              <li key={t.id} className="flex items-center gap-3 rounded-lg border border-border-subtle bg-background px-3 py-2.5">
                <p className="type-body-sm min-w-0 flex-1"><Rich text={t.text} /></p>
                <button
                  onClick={() => toggle(t.id)}
                  aria-pressed={on}
                  aria-label={`Upvote tip: ${t.votes + (on ? 1 : 0)} votes`}
                  className={cn(
                    "type-caption flex h-8 shrink-0 items-center gap-1 rounded-lg border px-2.5 font-medium tabular-nums transition-colors",
                    on ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:bg-muted",
                  )}
                >
                  <ArrowUp className="size-3.5" /> {t.votes + (on ? 1 : 0)}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------
 * Tabs
 * ----------------------------------------------------------------------- */

const STEPS: { id: string; title: string; blurb: string; demo: ReactNode }[] = [
  { id: "exams", title: "Read every past exam", blurb: "We break each exam into exercises and tag them with the topics they test, so you see what actually gets asked.", demo: <ExamsDemo /> },
  { id: "log", title: "Log your study steps", blurb: "Every session counts. Kollin spaces your reviews so what you learned stays learned, and tells you what is due.", demo: <LogDemo /> },
  { id: "notebook", title: "Build your notebook", blurb: "Clip theory, exam solutions and tutor answers into one notebook, organised around the topics you are studying.", demo: <NotebookDemo /> },
  { id: "community", title: "Learn from the community", blurb: "See which exercises trip people up and which tips help, from the students who sat the exam before you.", demo: <CommunityDemo /> },
];

export function Principle() {
  const [active, setActive] = useState(0);
  const uid = useId();

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const next = ["ArrowRight", "ArrowDown"].includes(e.key) ? 1 : ["ArrowLeft", "ArrowUp"].includes(e.key) ? -1 : 0;
    if (!next) return;
    e.preventDefault();
    const i = (active + next + STEPS.length) % STEPS.length;
    setActive(i);
    document.getElementById(`${uid}-tab-${i}`)?.focus();
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[19rem_1fr] lg:gap-10">
      <div role="tablist" aria-label="How Kollin works" aria-orientation="vertical" onKeyDown={onKey} className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0">
        {STEPS.map((s, i) => {
          const on = i === active;
          return (
            <button
              key={s.id}
              id={`${uid}-tab-${i}`}
              role="tab"
              aria-selected={on}
              aria-controls={`${uid}-panel`}
              tabIndex={on ? 0 : -1}
              onClick={() => setActive(i)}
              className={cn(
                "flex shrink-0 items-start gap-3 rounded-xl border px-4 py-3 text-left transition-colors",
                on ? "border-border bg-card shadow-xs" : "border-transparent hover:bg-muted",
              )}
            >
              <span className={cn("type-caption mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full font-semibold tabular-nums", on ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>{i + 1}</span>
              <span className="min-w-0">
                <span className="type-body-sm block font-semibold whitespace-nowrap lg:whitespace-normal">{s.title}</span>
                <span className="type-body-sm mt-1 hidden text-muted-foreground lg:block">{s.blurb}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div id={`${uid}-panel`} role="tabpanel" aria-labelledby={`${uid}-tab-${active}`} className="min-w-0 rounded-2xl border border-border bg-card p-5 shadow-xs md:p-6">
        <Typography role="body-sm" tone="muted" className="mb-4 lg:hidden">{STEPS[active].blurb}</Typography>
        <div key={STEPS[active].id}>{STEPS[active].demo}</div>
      </div>
    </div>
  );
}
