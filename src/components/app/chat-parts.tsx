"use client";

import { BookOpen, Check, ExternalLink, Lightbulb, Search, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Confirmation, ConfirmationAccepted, ConfirmationAction, ConfirmationActions, ConfirmationRejected, ConfirmationRequest, ConfirmationTitle } from "@/components/ai-elements/confirmation";
import { Tool, ToolContent, ToolHeader, ToolInput, ToolOutput } from "@/components/ai-elements/tool";
import { Formula, Rich } from "@/components/rich";
import { Skeleton } from "@/components/ui/skeleton";
import { figureInput } from "@/lib/ai/visual";
import { actions } from "@/lib/study";
import { cn } from "@/lib/utils";
import type { TutorUIMessage } from "@/lib/ai/types";

import { useAi } from "./ai-context";
import { MatrixFigure } from "./figures/dynamic-figure";
import { LessonView } from "./figures/lesson-view";

type Part = TutorUIMessage["parts"][number];
type QuizPart = Extract<Part, { type: "tool-quiz" }>;
type NotePart = Extract<Part, { type: "tool-saveNote" }>;

/* -------------------------------------------------------------------------
 * quiz: a CLIENT tool. The model asks, the learner answers in the chat,
 * and the answer goes back to the model as the tool result.
 *
 * With a hint: a wrong FIRST answer shows the hint and allows one more try.
 * Mastery credit: right first time = full, right on retry = half, otherwise none.
 * ----------------------------------------------------------------------- */
export function QuizCard({ part, course, stale = false }: { part: QuizPart; course: string; stale?: boolean }) {
  const { addToolOutput } = useAi();
  const [firstWrong, setFirstWrong] = useState<number | null>(null);
  const [final, setFinal] = useState<number | null>(null);

  if (part.state === "input-streaming") {
    return <div className="my-2 h-24 animate-pulse rounded-xl bg-muted" aria-label="Preparing a question" />;
  }
  if (part.state === "output-error") return null;

  const q = part.input;
  const answered = part.state === "output-available";
  const chosen = answered ? part.output.chosen : final;
  const done = chosen !== null && chosen !== undefined;
  const retrying = !done && firstWrong !== null;
  // The learner moved on without answering: the server closed this call as "skipped", so do not let it be answered later.
  const skipped = stale && !done && part.state === "input-available";

  const answer = (i: number) => {
    if (done || skipped || part.state !== "input-available" || i === firstWrong) return;
    const correct = i === q.correctIndex;
    // First miss with a hint available: nudge, don't finish.
    if (!correct && firstWrong === null && q.hint) {
      setFirstWrong(i);
      return;
    }
    const attempts = firstWrong !== null ? 2 : 1;
    setFinal(i);
    // Mastery: right first time = 1/1, right after the hint = 1/2, wrong = 0/1.
    actions.record({
      course,
      topic: q.topicId,
      kind: "practice",
      min: 1,
      correct: correct ? 1 : 0,
      total: correct && attempts === 2 ? 2 : 1,
      id: `chatquiz:${part.toolCallId}`,
    });
    void addToolOutput({ tool: "quiz", toolCallId: part.toolCallId, output: { chosen: i, correct, attempts } });
  };

  return (
    <div className="not-prose my-3 rounded-xl border border-border bg-card p-3.5">
      <div className="type-eyebrow text-brand-accent">Quick check</div>
      <p className="mt-1 text-sm font-medium"><Rich text={q.question} /></p>
      {q.display && <Formula tex={q.display} />}
      <div className="mt-3 grid gap-1.5" role="radiogroup" aria-label="Answers">
        {q.options.map((opt, i) => {
          const isCorrect = i === q.correctIndex;
          const isChosen = chosen === i;
          const wasWrong = firstWrong === i;
          return (
            <button
              key={i}
              role="radio"
              aria-checked={isChosen}
              disabled={done || wasWrong || skipped}
              onClick={() => answer(i)}
              className={cn(
                "flex items-center gap-2.5 rounded-lg border px-2.5 py-2 text-left text-sm transition-colors",
                !done && !wasWrong && "border-border hover:border-foreground/40 hover:bg-muted",
                wasWrong && !done && "border-level-hard-border bg-level-hard-muted text-level-hard-foreground opacity-80",
                done && isCorrect && "border-level-easy-border bg-level-easy-muted text-level-easy-foreground",
                done && isChosen && !isCorrect && "border-level-hard-border bg-level-hard-muted text-level-hard-foreground",
                done && !isCorrect && !isChosen && !wasWrong && "border-border opacity-50",
                done && wasWrong && "border-level-hard-border bg-level-hard-muted text-level-hard-foreground opacity-70",
              )}
            >
              <span className="grid size-5 shrink-0 place-items-center rounded border border-current/30 text-[0.6875rem] font-medium">
                {done && isCorrect ? <Check className="size-3" /> : (done && isChosen) || wasWrong ? <X className="size-3" /> : i + 1}
              </span>
              <span className="flex-1"><Rich text={opt} /></span>
            </button>
          );
        })}
      </div>

      {skipped && <p className="mt-3 text-xs text-subtle-foreground">Hoppade över</p>}
      {retrying && q.hint && (
        <p className="mt-3 flex gap-2 rounded-lg bg-muted px-2.5 py-2 text-sm" aria-live="polite">
          <Lightbulb className="mt-0.5 size-4 shrink-0 text-level-medium-foreground" />
          <span><span className="font-medium">Inte riktigt. </span><Rich text={q.hint} /> Prova igen.</span>
        </p>
      )}
      {done && (
        <p className="mt-3 rounded-lg bg-muted px-2.5 py-2 text-sm text-muted-foreground"><Rich text={q.explanation} /></p>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------
 * showFigure / showLesson: rendered from the tool INPUT as soon as it is
 * complete. The input streams in, so it is validated before drawing.
 * ----------------------------------------------------------------------- */
export function FigureCard({ part }: { part: Extract<Part, { type: "tool-showFigure" }> }) {
  const parsed = figureInput.safeParse(part.input);
  if (!parsed.success) return <Skeleton className="my-3 h-[340px] w-full rounded-xl" aria-label="Drawing the figure" />;
  return <MatrixFigure {...parsed.data} />;
}

export function LessonCard({ part }: { part: Extract<Part, { type: "tool-showLesson" }> }) {
  const input = part.input as { title?: string; blocks?: unknown[] } | undefined;
  return <LessonView title={input?.title} blocks={input?.blocks} streaming={part.state === "input-streaming"} />;
}

/* -------------------------------------------------------------------------
 * saveNote: runs on the server only after the learner approves it.
 * ----------------------------------------------------------------------- */
export function NoteConfirmation({ part, stale = false }: { part: NotePart; stale?: boolean }) {
  const { addToolApprovalResponse } = useAi();
  const approval = "approval" in part ? part.approval : undefined;
  const note = part.input;
  if (!note?.text) return null;
  if (stale && part.state === "approval-requested") {
    return <p className="not-prose my-2 text-xs text-subtle-foreground">Anteckningen sparades inte (hoppades över).</p>;
  }
  const respond = (approved: boolean) => approval && void addToolApprovalResponse({ id: approval.id, approved });

  return (
    <Confirmation approval={approval} state={part.state} className="not-prose my-3 border-border bg-card">
      <ConfirmationTitle>
        <ConfirmationRequest>
          Save this note to <strong className="font-medium">{note.topicId}</strong>?
          <span className="mt-1 block rounded-md bg-muted px-2 py-1.5 text-muted-foreground"><Rich text={note.text} /></span>
        </ConfirmationRequest>
        <ConfirmationAccepted>
          <Check className="size-4" /> <span>Saved to your notes.</span>
        </ConfirmationAccepted>
        <ConfirmationRejected>
          <X className="size-4" /> <span>Not saved.</span>
        </ConfirmationRejected>
      </ConfirmationTitle>
      <ConfirmationActions>
        <ConfirmationAction variant="outline" onClick={() => respond(false)}>Don’t save</ConfirmationAction>
        <ConfirmationAction onClick={() => respond(true)}>Save note</ConfirmationAction>
      </ConfirmationActions>
    </Confirmation>
  );
}

/* -------------------------------------------------------------------------
 * Server tools: show the work, collapsed. Lets a learner see (and trust)
 * what the answer was grounded in.
 * ----------------------------------------------------------------------- */
const titles: Record<string, (input: Record<string, unknown>) => string> = {
  searchTopics: (i) => `Searched topics for “${String(i.query ?? "")}”`,
  getTopic: (i) => `Read the theory for ${String(i.topicId ?? "topic")}`,
  findExamParts: (i) => `Looked through exam parts on ${String(i.topicId ?? "topic")}`,
  analyzeMatrix: () => "Computed the matrix facts",
  web_search: (i) => `Searched the web${i.query ? ` for “${String(i.query)}”` : ""}`,
};

export function ToolStep({ part }: { part: Part }) {
  if (!part.type.startsWith("tool-")) return null;
  const p = part as unknown as { type: `tool-${string}`; state: Parameters<typeof ToolHeader>[0]["state"]; input?: unknown; output?: unknown; errorText?: string };
  const name = p.type.slice(5);
  const title = titles[name]?.((p.input ?? {}) as Record<string, unknown>) ?? name;
  return (
    <Tool className="my-1.5 mb-1.5 border-border-subtle bg-card text-xs">
      <ToolHeader type={p.type as `tool-${string}`} state={p.state} title={title} className="p-2" />
      <ToolContent>
        {p.input !== undefined && <ToolInput input={p.input as never} />}
        {(p.output !== undefined || p.errorText) && <ToolOutput output={p.output as never} errorText={p.errorText} />}
      </ToolContent>
    </Tool>
  );
}

/** Small inline line for navigation done on the learner's behalf. */
export function OpenedTopic({ part }: { part: Extract<Part, { type: "tool-openTopic" }> }) {
  if (part.state === "input-streaming") return null;
  return (
    <div className="not-prose my-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
      <ExternalLink className="size-3.5" /> Opened {part.input?.topicId}
    </div>
  );
}

/* -------------------------------------------------------------------------
 * Sources: exam parts the tutor used. Internal links, so use next/link and
 * close the panel instead of a hard navigation.
 * ----------------------------------------------------------------------- */
export function SourceList({ sources }: { sources: { id: string; url: string; title: string }[] }) {
  const { setOpen } = useAi();
  if (sources.length === 0) return null;
  return (
    <div className="not-prose mb-2 flex flex-wrap gap-1.5" aria-label="Sources">
      {sources.map((s) => (
        <Link
          key={s.id}
          href={s.url.split("#")[0]}
          onClick={() => setOpen(false)}
          className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium hover:border-brand-accent hover:text-brand-accent"
        >
          <BookOpen className="size-3 shrink-0" />
          <span className="truncate">{s.title}</span>
        </Link>
      ))}
    </div>
  );
}

export function ThinkingDots() {
  return (
    <span className="inline-flex items-center gap-1 py-1 text-muted-foreground" aria-label="Thinking">
      <Search className="mr-1 size-3.5" />
      <span className="size-1.5 animate-pulse rounded-full bg-current" />
      <span className="size-1.5 animate-pulse rounded-full bg-current [animation-delay:150ms]" />
      <span className="size-1.5 animate-pulse rounded-full bg-current [animation-delay:300ms]" />
    </span>
  );
}
