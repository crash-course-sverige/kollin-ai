import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * Learner progress states. These use the RESERVED data hues (green / yellow /
 * red / gray) and nothing else in the product may borrow them for chrome.
 * Class names are written out in full so Tailwind's scanner sees them.
 */
const states = {
  "not-started": {
    label: "Not started",
    className: "bg-level-unrated-muted text-level-unrated-foreground border-level-unrated-border",
  },
  learning: {
    label: "Learning",
    className: "bg-level-hard-muted text-level-hard-foreground border-level-hard-border",
  },
  practicing: {
    label: "Practicing",
    className: "bg-level-medium-muted text-level-medium-foreground border-level-medium-border",
  },
  mastered: {
    label: "Mastered",
    className: "bg-level-easy-muted text-level-easy-foreground border-level-easy-border",
  },
} as const;

export type MasteryState = keyof typeof states;

export function MasteryBadge({ state, className }: { state: MasteryState; className?: string }) {
  const s = states[state];
  return (
    <Badge variant="outline" className={cn("font-medium", s.className, className)}>
      {s.label}
    </Badge>
  );
}

/** Bar fill color for a mastery percentage (data hues, same mapping as the badge). */
export function masteryBarClass(percent: number, started: boolean) {
  if (!started) return "bg-level-unrated";
  if (percent >= 80) return "bg-level-easy";
  if (percent >= 50) return "bg-level-medium";
  return "bg-level-hard";
}
