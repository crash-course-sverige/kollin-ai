"use client";

import { Check } from "lucide-react";
import { useState } from "react";

import { Formula, Rich } from "@/components/rich";
import { Button } from "@/components/ui/button";

export type WorkedStep = { text: string; tex?: string };

/**
 * A solution revealed one step at a time. Seeing the next step only after
 * trying the previous one in your head is the point.
 */
export function WorkedExample({ title, steps }: { title?: string; steps: WorkedStep[] }) {
  const [shown, setShown] = useState(1);
  const done = shown >= steps.length;

  return (
    <section className="not-prose my-3 rounded-xl border border-border bg-card p-3.5" aria-label={title ?? "Worked example"}>
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <div className="type-eyebrow text-brand-accent">Genomgånget exempel</div>
          {title && <h4 className="type-card-title mt-0.5">{title}</h4>}
        </div>
        <span className="text-xs text-subtle-foreground tabular-nums">
          Steg {shown} av {steps.length}
        </span>
      </div>

      <ol className="mt-3 space-y-3">
        {steps.slice(0, shown).map((s, i) => (
          <li key={i} className="flex gap-3">
            <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-muted text-xs font-semibold tabular-nums">{i + 1}</span>
            <div className="min-w-0 flex-1 text-sm">
              <p><Rich text={s.text} /></p>
              {s.tex && <Formula tex={s.tex} />}
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-3 flex items-center gap-2">
        {done ? (
          <span className="inline-flex items-center gap-1.5 text-sm text-level-easy-foreground">
            <Check className="size-4" /> Klart
          </span>
        ) : (
          <>
            <Button size="sm" onClick={() => setShown((n) => n + 1)}>Nästa steg</Button>
            <Button size="sm" variant="ghost" onClick={() => setShown(steps.length)}>Visa alla</Button>
          </>
        )}
        {shown > 1 && (
          <Button size="sm" variant="ghost" className="ml-auto" onClick={() => setShown(1)}>Börja om</Button>
        )}
      </div>
    </section>
  );
}
