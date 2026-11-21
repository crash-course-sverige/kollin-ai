"use client";

import { ArrowRight, Check } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { useStudy } from "@/lib/study";
import { getCourse } from "@/mock";
import { PROGRAMS, SCHOOLS, type SchoolId } from "@/mock/programs";
import { cn } from "@/lib/utils";

import { moduleTotals, startTopics } from "./data";

const OTHER = "other";

function Choice({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      className={cn(
        "flex min-h-touch w-full items-center gap-3 rounded-xl border px-4 py-2.5 text-left text-sm font-medium transition-colors",
        on ? "border-primary bg-surface-brand" : "border-border bg-background hover:bg-muted",
      )}
    >
      <span className="min-w-0 flex-1">{children}</span>
      {on && <Check className="size-4 shrink-0" />}
    </button>
  );
}

function StepLabel({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center gap-2.5">
      <span className="type-caption flex size-6 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground tabular-nums">{n}</span>
      <Typography role="body-sm" as="h3" className="font-semibold">{children}</Typography>
    </div>
  );
}

/**
 * Demo funnel: school → program → we show the course. The program → course
 * mapping is authored (src/mock/programs.ts), so "my program isn't listed"
 * falls back to the school's course rather than an empty state.
 */
export function DemoPicker() {
  const { actions } = useStudy(); // also boots the demo study store
  const [school, setSchool] = useState<SchoolId | null>(null);
  const [program, setProgram] = useState<string | null>(null);

  const programs = PROGRAMS.filter((p) => p.school === school);
  const picked = programs.find((p) => p.id === program);
  const code = picked?.course ?? (program === OTHER ? SCHOOLS.find((s) => s.id === school)?.course : undefined);
  const course = code ? getCourse(code) : undefined;

  return (
    <div className="grid gap-5 lg:grid-cols-[22rem_1fr]">
      <div className="space-y-6 rounded-2xl border border-border bg-card p-5 shadow-xs md:p-6">
        <div>
          <StepLabel n={1}>Where do you study?</StepLabel>
          <div className="space-y-2">
            {SCHOOLS.map((s) => (
              <Choice key={s.id} on={school === s.id} onClick={() => { setSchool(s.id); setProgram(null); }}>{s.name}</Choice>
            ))}
          </div>
        </div>

        <div className={cn("transition-opacity", !school && "pointer-events-none opacity-40")} aria-disabled={!school}>
          <StepLabel n={2}>Which program?</StepLabel>
          <div className="space-y-2">
            {school ? (
              <>
                {programs.map((p) => (
                  <Choice key={p.id} on={program === p.id} onClick={() => setProgram(p.id)}>{p.name}</Choice>
                ))}
                <Choice on={program === OTHER} onClick={() => setProgram(OTHER)}>
                  <span className="text-muted-foreground">My program isn’t listed</span>
                </Choice>
              </>
            ) : (
              <Typography role="body-sm" tone="subtle">Pick your school first.</Typography>
            )}
          </div>
        </div>
      </div>

      {/* Result */}
      <div aria-live="polite" className="min-w-0">
        {course ? (
          <motion.div
            key={course.code}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="flex h-full flex-col gap-5 rounded-2xl bg-field-brand p-5 text-on-brand md:p-7"
          >
            <div>
              <Typography role="eyebrow" tone="on-brand" className="opacity-75">
                {program === OTHER ? "Closest course we have" : "Your first-year course"}
              </Typography>
              <Typography role="display-lg" as="h3" tone="on-brand" className="mt-1.5">{course.name}</Typography>
              <Typography role="body-sm" tone="on-brand" className="opacity-80">{course.code} · {course.school} · {course.credits} hp</Typography>
            </div>

            <dl className="grid grid-cols-3 gap-3">
              {[
                [course.exams, "past exams read"],
                [course.modules.length, "modules"],
                [course.topics.length, "topics mapped"],
              ].map(([n, l]) => (
                <div key={l} className="rounded-xl bg-white/10 px-3.5 py-3">
                  <dd className="type-stat">{n}</dd>
                  <dt className="type-caption opacity-75">{l}</dt>
                </div>
              ))}
            </dl>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Typography role="eyebrow" tone="on-brand" className="opacity-75">Where we would start you</Typography>
                <ol className="mt-2 space-y-2">
                  {startTopics(course).map((t, i) => (
                    <li key={t.id} className="flex items-start gap-2.5">
                      <span className="type-caption mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-white/15 font-semibold tabular-nums">{i + 1}</span>
                      <span className="type-body-sm"><span className="font-medium">{t.name}</span> <span className="opacity-70">· {t.exercises} exercises</span></span>
                    </li>
                  ))}
                </ol>
              </div>
              <div>
                <Typography role="eyebrow" tone="on-brand" className="opacity-75">What is inside</Typography>
                <ul className="mt-2 space-y-1.5">
                  {moduleTotals(course).slice(0, 5).map((m) => (
                    <li key={m.name} className="type-body-sm flex justify-between gap-3">
                      <span className="truncate">{m.name}</span>
                      <span className="shrink-0 opacity-70 tabular-nums">{m.topics}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {program === OTHER && (
              <Typography role="body-sm" tone="on-brand" className="opacity-80">
                We have not mapped your program yet. This is the closest course, so you can try Kollin for real.
              </Typography>
            )}

            <div className="mt-auto flex flex-wrap gap-3 pt-1">
              <Button asChild variant="inverse" size="touch">
                <Link href={`/app/course/${course.code}`} onClick={() => actions.setCourse(course.code)}>
                  Start with {course.code} <ArrowRight />
                </Link>
              </Button>
              <Button asChild variant="ghost" size="touch" className="text-on-brand hover:bg-white/10 hover:text-on-brand">
                <Link href="/app" onClick={() => actions.setCourse(course.code)}>See today’s plan</Link>
              </Button>
            </div>
          </motion.div>
        ) : (
          <div className="flex h-full min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-canvas-alt p-8 text-center">
            <Typography role="card-title" as="p">Your course shows up here</Typography>
            <Typography role="body-sm" tone="muted" className="mt-1 max-w-xs">
              Choose your school and program and we will pull up the course, the topics inside it and where to begin.
            </Typography>
          </div>
        )}
      </div>
    </div>
  );
}
