"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

import { masteryBarClass } from "@/components/mastery-badge";
import { Rich } from "@/components/rich";
import { cn } from "@/lib/utils";

const STEPS = ["Read", "Tag", "Plan", "Master"];

const MAP = [
  { name: "Gausseliminering", pct: 86 },
  { name: "Rang", pct: 64 },
  { name: "Satsen om lösbarhet", pct: 38 },
];

/**
 * The whole idea in one looping card: an exam exercise is read, tagged with
 * topics, folded into your plan, and your mastery climbs as you practise.
 * Content is a real tag pair from the example exam in the mock data.
 */
export function HeroVisual() {
  const reduce = useReducedMotion();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setTick((t) => (t + 1) % 7), 1500);
    return () => clearInterval(id);
  }, [reduce]);

  // 0..3 walk the steps, then hold on the finished state before looping.
  const step = reduce ? 3 : Math.min(tick, 3);

  return (
    <div className="relative mx-auto w-full max-w-md" aria-label="How Kollin turns an exam exercise into a study plan">
      {/* Step rail */}
      <ol className="mb-3 grid grid-cols-4 gap-1.5" aria-hidden>
        {STEPS.map((label, i) => (
          <li key={label} className="space-y-1.5">
            <div className="h-1 overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={false}
                animate={{ width: i <= step ? "100%" : "0%" }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
            <span className={cn("type-caption transition-colors", i <= step ? "font-medium text-foreground" : "text-subtle-foreground")}>
              {i + 1} · {label}
            </span>
          </li>
        ))}
      </ol>

      <div className="space-y-3">
        {/* 1. The exam exercise */}
        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between gap-3">
            <span className="type-eyebrow text-subtle-foreground">Exempeltenta · Uppgift 1b</span>
            <span className="type-caption rounded-full bg-muted px-2 py-0.5 font-medium text-muted-foreground">3 p</span>
          </div>
          <p className="type-body-sm mt-2 text-muted-foreground">
            <Rich text="Betrakta systemet $x+2y+z=1,\ 2x+4y+3z=4,\ x+2y+2z=3$." />
          </p>
          <p className="type-body mt-1 font-medium">Bestäm rangen för koefficientmatrisen.</p>

          <div className="mt-3 flex min-h-7 flex-wrap gap-1.5">
            {["Rang", "Satsen om lösbarhet"].map((t, i) => (
              <motion.span
                key={t}
                className="type-caption inline-flex items-center rounded-full border border-border bg-surface-brand px-2.5 py-1 font-medium text-brand-accent"
                initial={false}
                animate={step >= 1 ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.9, y: 4 }}
                transition={{ duration: 0.35, delay: step >= 1 ? 0.12 * i : 0 }}
              >
                {t}
              </motion.span>
            ))}
          </div>
        </div>

        {/* 2–4. Your map */}
        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="type-eyebrow text-subtle-foreground">Your map</span>
            <motion.span
              className="type-caption font-medium text-muted-foreground"
              initial={false}
              animate={{ opacity: step >= 2 ? 1 : 0 }}
            >
              126 exams behind it
            </motion.span>
          </div>
          <ul className="mt-3 space-y-3">
            {MAP.map((m, i) => (
              <li key={m.name} className="space-y-1.5">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="type-body-sm font-medium">{m.name}</span>
                  <motion.span
                    className="type-caption text-muted-foreground tabular-nums"
                    initial={false}
                    animate={{ opacity: step >= 3 ? 1 : 0 }}
                  >
                    {m.pct}%
                  </motion.span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <motion.div
                    className={cn("h-full rounded-full", masteryBarClass(m.pct, true))}
                    initial={false}
                    animate={{ width: step >= 3 ? `${m.pct}%` : step >= 2 ? "6%" : "0%" }}
                    transition={{ duration: 0.8, delay: step >= 3 ? 0.15 * i : 0, ease: "easeOut" }}
                  />
                </div>
              </li>
            ))}
          </ul>
          <motion.div
            className="mt-4 rounded-xl bg-field-brand px-3.5 py-3 text-on-brand"
            initial={false}
            animate={step >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
            transition={{ duration: 0.4 }}
          >
            <p className="type-eyebrow opacity-75">Next up</p>
            <p className="type-body-sm mt-0.5 font-medium">Determinant. It builds on Gausseliminering, which you just mastered.</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
