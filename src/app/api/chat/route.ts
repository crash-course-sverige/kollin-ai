import { createUIMessageStreamResponse } from "ai";

import { demoStream } from "@/lib/ai/demo";
import { hasGateway } from "@/lib/ai/models";
import type { LearnerState, TutorContext } from "@/lib/ai/tools";
import { resolveStaleToolCalls } from "@/lib/ai/sanitize";
import { routeRequest, streamTutor } from "@/lib/ai/tutor";
import type { ChatRequestBody, TutorUIMessage } from "@/lib/ai/types";

export const maxDuration = 60;

const MAX_MESSAGES = 60;
const MAX_TEXT = 6000;

/**
 * Per-learner burst limit. In-memory, so it only protects a single server
 * instance. Fine for the prototype; real limiting needs a shared store.
 */
const hits = new Map<string, number[]>();
function limited(userId: string) {
  const now = Date.now();
  const recent = (hits.get(userId) ?? []).filter((t) => now - t < 60_000);
  recent.push(now);
  hits.set(userId, recent);
  return recent.length > 20;
}

const clean = (s: unknown, max = 80) => (typeof s === "string" ? s.slice(0, max) : undefined);

function sanitizeLearner(l: unknown): LearnerState {
  const o = (l ?? {}) as Partial<LearnerState>;
  const mastery: Record<string, number> = {};
  for (const [k, v] of Object.entries(o.mastery ?? {}).slice(0, 200)) if (typeof v === "number") mastery[k.slice(0, 40)] = Math.max(0, Math.min(100, v));
  return {
    mastery,
    due: (o.due ?? []).filter((x) => typeof x === "string").slice(0, 50),
    accepted: (o.accepted ?? [])
      .filter((a) => a && typeof a.id === "string" && typeof a.name === "string")
      .slice(0, 50)
      .map((a) => ({ id: a.id.slice(0, 40), name: a.name.slice(0, 80), parent: String(a.parent ?? "").slice(0, 40), module: Number(a.module) || 0, course: String(a.course ?? "").slice(0, 20) })),
  };
}

export async function POST(req: Request) {
  let body: ChatRequestBody;
  try {
    body = (await req.json()) as ChatRequestBody;
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const messages = body.messages;
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_MESSAGES) {
    return Response.json({ error: "Invalid messages" }, { status: 400 });
  }
  const tooLong = messages.some((m) => m.parts?.some((p) => p.type === "text" && p.text.length > MAX_TEXT));
  if (tooLong) return Response.json({ error: "Message too long" }, { status: 413 });

  // Anonymous id from the browser: only used to tag spend and rate limit. Never trusted for access.
  const userId = clean(body.userId, 64) ?? "anonymous";
  if (limited(userId)) return Response.json({ error: "Too many requests. Wait a moment." }, { status: 429 });

  const ctx: TutorContext = {
    course: clean(body.scope?.course, 20),
    topicId: clean(body.scope?.topicId, 40),
    learner: sanitizeLearner(body.learner),
    userId,
  };

  const last = messages.at(-1)!;
  // Close client tool calls the learner never answered, or the provider rejects the history.
  const typed = resolveStaleToolCalls(messages as TutorUIMessage[]);

  if (!hasGateway()) {
    return createUIMessageStreamResponse({ stream: demoStream(typed, ctx) });
  }

  // Continuations (a quiz answer, an approval) skip routing: they are cheap by nature.
  const text = typed
    .filter((m) => m.role === "user")
    .at(-1)
    ?.parts.flatMap((p) => (p.type === "text" ? [p.text] : []))
    .join(" ");
  const route = last.role === "assistant" ? { tier: "fast" as const, webSearch: false } : await routeRequest(text ?? "", ctx);

  return createUIMessageStreamResponse({ stream: streamTutor({ messages: typed, ctx, ...route }) });
}
