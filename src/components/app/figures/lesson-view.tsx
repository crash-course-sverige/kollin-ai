"use client";

import { MessageResponse } from "@/components/ai-elements/message";
import { Formula } from "@/components/rich";
import { Skeleton } from "@/components/ui/skeleton";
import { lessonBlock, normalizeBlock, type LessonBlock } from "@/lib/ai/visual";
import { cn } from "@/lib/utils";

import { MatrixFigure } from "./dynamic-figure";
import { WorkedExample } from "./worked-example";

const callout = {
  remember: { label: "Kom ihåg", cls: "border-border bg-surface-brand" },
  warning: { label: "Se upp", cls: "border-level-medium-border bg-level-medium-muted" },
  tip: { label: "Tips", cls: "border-border-subtle bg-muted" },
} as const;

/**
 * Renders a lesson from blocks. The input arrives while the model is still
 * writing it, so every block is validated on its own and unfinished ones are
 * skipped instead of crashing the render.
 */
export function LessonView({ title, blocks, streaming = false }: { title?: string; blocks?: unknown[]; streaming?: boolean }) {
  const valid: LessonBlock[] = [];
  for (const b of blocks ?? []) {
    const r = lessonBlock.safeParse(normalizeBlock(b));
    if (r.success) valid.push(r.data);
  }

  let section = 0;

  return (
    <article className="not-prose my-3 space-y-3 rounded-2xl border border-border bg-card p-4" aria-label={title ?? "Lesson"}>
      {title && <h3 className="type-section-title">{title}</h3>}

      {valid.map((b, i) => {
        switch (b.type) {
          case "heading":
            section += 1;
            return <h4 key={i} className="type-card-title pt-2">{section}. {b.text}</h4>;
          case "text":
            return <div key={i} className="text-sm leading-relaxed [&_p]:my-2"><MessageResponse>{b.text}</MessageResponse></div>;
          case "formula":
            return <Formula key={i} tex={b.tex} />;
          case "figure": {
            const { type: _t, ...fig } = b;
            void _t;
            return <MatrixFigure key={i} {...fig} />;
          }
          case "worked":
            return <WorkedExample key={i} title={b.title} steps={b.steps} />;
          case "callout":
            return (
              <aside key={i} className={cn("rounded-xl border px-3 py-2 text-sm", callout[b.tone].cls)}>
                <span className="font-semibold">{callout[b.tone].label}: </span>
                {b.text}
              </aside>
            );
        }
      })}

      {streaming && <Skeleton className="h-16 w-full rounded-xl" aria-label="Writing the rest of the lesson" />}
    </article>
  );
}
