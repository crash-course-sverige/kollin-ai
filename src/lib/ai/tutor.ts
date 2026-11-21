import {
  createAgentUIStream,
  createUIMessageStream,
  gateway,
  generateText,
  isStepCount,
  Output,
  ToolLoopAgent,
  type UIMessageChunk,
} from "ai";
import { z } from "zod";

import { TOPIC_NAMES } from "@/mock";

import { gatewayOptions, MODELS } from "./models";
import { normalizeToolInput } from "./visual";
import { makeTools, type TutorContext } from "./tools";
import type { TutorUIMessage } from "./types";

type Chunk = UIMessageChunk<TutorUIMessage["metadata"], { suggestions: { items: string[] } }>;

/* -------------------------------------------------------------------------
 * 1. Router: a tiny model decides how much brain this request needs.
 *    Cheap call, hard timeout, and ANY failure falls back to the strong model,
 *    so routing can only save money, never break the chat.
 * ----------------------------------------------------------------------- */

const routeSchema = z.object({
  tier: z
    .enum(["fast", "deep"])
    .describe(
      "fast ONLY for: greetings, navigation or app-usage requests, and one-line definitions with no derivation. deep for EVERYTHING else: any explanation of why/how in math, figures and lessons, anything that needs looking up exam parts or topics, quizzes, checking a solution, study planning.",
    ),
  webSearch: z.boolean().describe("true only if the question needs current external information that is not course material"),
});

export async function routeRequest(prompt: string, ctx: TutorContext): Promise<{ tier: "fast" | "deep"; webSearch: boolean }> {
  try {
    const { output } = await generateText({
      model: MODELS.router,
      instructions:
        "Classify a study-tutor request for a Swedish university engineering student. A wrong math explanation costs the learner far more than a few cents, so be conservative: when unsure choose deep.",
      prompt,
      output: Output.object({ schema: routeSchema }),
      providerOptions: gatewayOptions({ tier: "router", task: "route", course: ctx.course, userId: ctx.userId }),
      abortSignal: AbortSignal.timeout(5000),
    });
    return output;
  } catch {
    return { tier: "deep", webSearch: false };
  }
}

/* -------------------------------------------------------------------------
 * 2. Instructions
 * ----------------------------------------------------------------------- */

function instructionsFor(ctx: TutorContext): string {
  const nameOf = (id: string) => ctx.learner.accepted.find((a) => a.id === id)?.name ?? TOPIC_NAMES[id] ?? id;
  const weakest = Object.entries(ctx.learner.mastery)
    .sort((a, b) => a[1] - b[1])
    .slice(0, 5)
    .map(([id, m]) => `${nameOf(id)} (${m}%)`);
  return [
    "You are Kollin's study tutor for Swedish university engineering students.",
    "Reply in the language the learner writes in (usually Swedish). Be concise, warm and precise; no filler, no emoji.",
    "Write math with $...$ for inline. Never use $$ blocks or LaTeX environments.",
    "",
    "Ground yourself in the course material with your tools instead of answering from memory:",
    "- Topic ids are short slugs like \"det\" or \"gauss\", never numbers. Use searchTopics to find an id, getTopic for theory, findExamParts for real exam parts.",
    ctx.topicId ? `- The learner has the topic with id \"${ctx.topicId}\" open. When they say \"this\" or \"det här\", use exactly that id.` : "",
    "- If a tool returns an error, read it and retry with a corrected call before answering.",
    "- Be mathematically careful: do not claim a property unless it is correct. If unsure, say so.",
    "- Never invent exam questions, points or sources. If a tool finds nothing, say so.",
    "- Do not reveal an exam part's answer unless the learner asks for it. Prefer a hint first.",
    "- To check understanding or when asked to practise, call quiz with ONE question; wait for the answer, then react to it. Put a displayed matrix or formula in `display` and write a `hint` that nudges without giving the answer away.",
    "",
    "Visuals (the app draws them; you only describe them):",
    "- To show what a 2x2 matrix does geometrically, call showFigure with the matrix and optional vectors. NEVER invent coordinates: the app computes every image and eigen-direction itself.",
    "- For an in-depth explanation (a genomgång, a lesson) call showLesson with headings, text, formulas, a figure, a worked example and a remember-callout.",
    "- Before writing ANY number about a specific matrix (eigenvalues, determinant), call analyzeMatrix and quote its results exactly.",
    "- Do not repeat in text what a figure or lesson already shows. After it, add at most one short sentence and offer a quiz.",
    "",
    "- Use openTopic only when the learner wants to go somewhere. Use saveNote only when they ask you to save something.",
    "",
    `Learner context: ${ctx.course ? `course ${ctx.course}` : "no course open"}${ctx.topicId ? `, viewing topic ${nameOf(ctx.topicId)} (${ctx.topicId})` : ""}.`,
    weakest.length ? `Weakest studied topics: ${weakest.join(", ")}.` : "The learner has not studied any topics yet.",
    ctx.learner.due.length ? `Due for review: ${ctx.learner.due.slice(0, 6).map(nameOf).join(", ")}.` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

/* -------------------------------------------------------------------------
 * 3. Follow-up chips (cheap model, runs after the answer, never blocks it)
 * ----------------------------------------------------------------------- */

async function followUps(question: string, answer: string, ctx: TutorContext): Promise<string[]> {
  if (answer.trim().length < 40) return [];
  try {
    const { output } = await generateText({
      model: MODELS.router,
      instructions:
        "Write 3 short follow-up prompts (max 7 words each) the learner could tap next. Same language as the answer. Concrete, not generic. No quotes.",
      prompt: `Learner asked: ${question}\n\nTutor answered: ${answer.slice(0, 1500)}`,
      output: Output.array({ element: z.string().max(60), minItems: 2, maxItems: 3 }),
      providerOptions: gatewayOptions({ tier: "router", task: "followups", course: ctx.course, userId: ctx.userId }),
      abortSignal: AbortSignal.timeout(6000),
    });
    return output;
  } catch {
    return [];
  }
}

/* -------------------------------------------------------------------------
 * 4. The streaming tutor
 * ----------------------------------------------------------------------- */

const lastUserText = (messages: TutorUIMessage[]) =>
  messages
    .filter((m) => m.role === "user")
    .at(-1)
    ?.parts.flatMap((p) => (p.type === "text" ? [p.text] : []))
    .join(" ") ?? "";

export function streamTutor(args: { messages: TutorUIMessage[]; ctx: TutorContext; tier: "fast" | "deep"; webSearch: boolean }) {
  const { messages, ctx, tier, webSearch } = args;
  const model = MODELS[tier];
  let usage: { inputTokens?: number; outputTokens?: number } | undefined;
  let generationId: string | undefined;

  const tools = {
    ...makeTools(ctx),
    // Executed by the Gateway itself and usable with any model. Off unless the router asks for it.
    web_search: gateway.tools.perplexitySearch({ maxResults: 5, searchLanguageFilter: ["sv", "en"] }),
  };

  const agent = new ToolLoopAgent({
    model,
    instructions: instructionsFor(ctx),
    tools,
    activeTools: webSearch ? undefined : (["searchTopics", "getTopic", "findExamParts", "analyzeMatrix", "showFigure", "showLesson", "quiz", "openTopic", "saveNote"] as const),
    // saveNote pauses for the learner's approval before it runs.
    toolApproval: { saveNote: "user-approval" },
    stopWhen: isStepCount(8),
    // A near-miss in a tool's SHAPE is fixed in code (free) instead of costing a retry
    // that re-sends the whole conversation. Anything unfixable falls through to the normal error.
    repairToolCall: async ({ toolCall }) => {
      try {
        const fixed = normalizeToolInput(toolCall.toolName, JSON.parse(toolCall.input));
        return fixed === undefined ? null : { ...toolCall, input: JSON.stringify(fixed) };
      } catch {
        return null;
      }
    },
    providerOptions: gatewayOptions({ tier, task: "tutor", course: ctx.course, userId: ctx.userId }),
    onEnd: (event) => {
      const e = event as unknown as { usage?: { inputTokens?: number; outputTokens?: number }; providerMetadata?: { gateway?: { generationId?: string } } };
      usage = e.usage;
      generationId = e.providerMetadata?.gateway?.generationId;
    },
  });

  return createUIMessageStream<TutorUIMessage>({
    // Resumed runs (a quiz answer, an approval) must continue the SAME assistant message.
    originalMessages: messages,
    onError: () => "The tutor could not answer just now. Try again in a moment.",
    execute: async ({ writer }) => {
      const send = (c: Chunk) => writer.write(c as Parameters<typeof writer.write>[0]);
      const agentStream = await createAgentUIStream({ agent, uiMessages: messages, sendReasoning: true, sendSources: true });

      const toolNames = new Map<string, string>();
      let answer = "";
      let held: Chunk | null = null;

      // One `start` of our own, so the message id comes from originalMessages (see above).
      send({ type: "start" });

      for await (const raw of agentStream) {
        const chunk = raw as Chunk;
        if (chunk.type === "start") continue;
        // The SDK masks provider errors as "An error occurred." Log nothing here (the SDK already
        // logs the real error server-side) and show something a learner can act on.
        if (chunk.type === "error") {
          send({ type: "error", errorText: "The tutor hit a problem answering that. Try again, or rephrase the question." });
          continue;
        }
        if (chunk.type === "tool-input-start" || chunk.type === "tool-input-available") toolNames.set(chunk.toolCallId, chunk.toolName);
        if (chunk.type === "text-delta") answer += chunk.delta;
        // Hold the final `finish` so we can still append chips and metadata before the message closes.
        if (chunk.type === "finish") {
          held = chunk;
          continue;
        }
        send(chunk);

        // Turn exam parts the tutor looked at into citations the UI can show.
        if (chunk.type === "tool-output-available" && toolNames.get(chunk.toolCallId) === "findExamParts") {
          const parts = (chunk.output as { parts?: { examId: string; examTitle: string; exercise: number; part: string; href: string }[] })?.parts ?? [];
          for (const p of parts) {
            send({ type: "source-url", sourceId: `${p.examId}-${p.exercise}${p.part}`, url: p.href, title: `${p.examTitle} · Uppgift ${p.exercise}${p.part}` });
          }
        }
      }

      const items = await followUps(lastUserText(messages), answer, ctx);
      if (items.length) send({ type: "data-suggestions", data: { items } });
      send({ type: "message-metadata", messageMetadata: { tier, model, usage, generationId } });
      if (held) send(held);
    },
  });
}
