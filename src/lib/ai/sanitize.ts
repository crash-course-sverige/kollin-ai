/**
 * Client tools (quiz, approvals) wait for the learner. If the learner moves on
 * and sends a new message, the history then contains a tool call that never got
 * a result, and the model provider rejects it (AI_MissingToolResultsError).
 *
 * Before the model sees the history, every such stale call in an EARLIER
 * assistant message is closed as an error the model can read: "the learner
 * moved on". The last message is left alone (it may be a live continuation).
 *
 * Import-free on purpose so it can be unit-tested with plain Node.
 */

type LoosePart = { type: string; state?: string; [key: string]: unknown };
type LooseMessage = { role: string; parts: LoosePart[] };

const UNRESOLVED = new Set(["input-streaming", "input-available", "approval-requested"]);

export function resolveStaleToolCalls<M extends LooseMessage>(messages: M[]): M[] {
  return messages.map((m, i) => {
    if (m.role !== "assistant" || i === messages.length - 1) return m;
    let changed = false;
    const parts = m.parts.map((p) => {
      if (p.type.startsWith("tool-") && p.state && UNRESOLVED.has(p.state)) {
        changed = true;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { approval, ...rest } = p;
        return { ...rest, state: "output-error", errorText: "The learner did not answer this and moved on." };
      }
      return p;
    });
    return changed ? ({ ...m, parts } as M) : m;
  });
}
