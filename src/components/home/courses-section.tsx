import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { courses } from "@/mock";

import { moduleTotals } from "./data";

export function CoursesSection() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {courses.map((c) => {
        const mods = moduleTotals(c);
        const max = Math.max(...mods.map((m) => m.exercises));
        return (
          <Link
            key={c.code}
            href={`/app/course/${c.code}`}
            className="group flex flex-col rounded-2xl border border-border bg-card p-5 shadow-xs transition-colors hover:border-primary"
          >
            <div className="flex items-center justify-between gap-3">
              <Typography role="eyebrow">{c.schoolShort}</Typography>
              <Typography role="caption" tone="subtle">{c.credits} hp</Typography>
            </div>
            <Typography role="card-title" as="h3" className="mt-2">{c.name}</Typography>
            <Typography role="body-sm" tone="muted">{c.code} · {c.school}</Typography>

            {/* Module weight silhouette */}
            <div className="mt-5 flex h-14 items-end gap-1.5" aria-hidden>
              {mods.map((m) => (
                <div key={m.name} className="flex-1 rounded-t-sm bg-primary/80 transition-colors group-hover:bg-primary" style={{ height: `${Math.max(8, (m.exercises / max) * 100)}%` }} />
              ))}
            </div>

            <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-border-subtle pt-4">
              {[
                [c.exams, "exams"],
                [mods.length, "modules"],
                [c.topics.length, "topics"],
              ].map(([n, l]) => (
                <div key={l}>
                  <dt className="type-caption text-subtle-foreground">{l}</dt>
                  <dd className="type-stat">{n}</dd>
                </div>
              ))}
            </dl>

            <span className="type-body-sm mt-5 inline-flex items-center gap-1.5 font-medium">
              Open course <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        );
      })}

      <div className="flex flex-col justify-between gap-6 rounded-2xl border border-dashed border-border bg-canvas-alt p-5">
        <div>
          <Typography role="eyebrow" tone="subtle">Next up</Typography>
          <Typography role="card-title" as="h3" className="mt-2">More courses every period</Typography>
          <Typography role="body-sm" tone="muted" className="mt-1">
            We add the courses students are about to sit. Pick your program to see what we cover for it today.
          </Typography>
        </div>
        <Button asChild variant="outline" size="touch" className="self-start">
          <a href="#demo">Find my program</a>
        </Button>
      </div>
    </div>
  );
}
