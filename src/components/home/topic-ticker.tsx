import { TOPIC_NAMES } from "@/mock";

/** Slow ticker of real topic names from the tagging data. Decorative: hidden from assistive tech. */
export function TopicTicker() {
  const names = Object.values(TOPIC_NAMES);
  return (
    <div className="marquee overflow-hidden border-y border-border-subtle bg-canvas-alt py-3.5" aria-hidden>
      <div className="marquee-track flex w-max gap-3 pr-3">
        {[...names, ...names].map((n, i) => (
          <span key={i} className="type-body-sm shrink-0 rounded-full border border-border bg-card px-3.5 py-1.5 whitespace-nowrap text-muted-foreground">
            {n}
          </span>
        ))}
      </div>
    </div>
  );
}
