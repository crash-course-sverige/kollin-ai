import { createUIMessageStream } from "ai";

import { mockReply } from "@/components/app/mock-ai";
import { content as topicContent, exams, TOPIC_NAMES } from "@/mock";

import { makeTools, type TutorContext } from "./tools";
import type { TutorUIMessage } from "./types";

/**
 * DEMO MODE. Used when no AI Gateway credentials exist. It emits exactly the
 * same stream parts the real tutor does (reasoning, server tools, a client
 * quiz, an approval request, sources, follow-up chips), so every piece of chat
 * UI is exercised without a key. It is a script, not a model.
 */

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
let n = 0;
const id = (p: string) => `${p}-${Date.now().toString(36)}-${n++}`;

const textOf = (m?: TutorUIMessage) => m?.parts.flatMap((p) => (p.type === "text" ? [p.text] : [])).join(" ") ?? "";

/** Find a topic id mentioned in free text, else fall back. */
function topicIn(text: string, ctx: TutorContext): string | undefined {
  const t = text.toLowerCase();
  const all: Record<string, string> = { ...TOPIC_NAMES };
  for (const a of ctx.learner.accepted) all[a.id] = a.name;
  const hit = Object.entries(all).find(([tid, name]) => t.includes(name.toLowerCase().split(" ")[0]) && name.length > 3 && tid !== "spar");
  return hit?.[0];
}

export function demoStream(messages: TutorUIMessage[], ctx: TutorContext) {
  const last = messages.at(-1);
  const prompt = textOf(messages.filter((m) => m.role === "user").at(-1));
  const lower = prompt.toLowerCase();
  const tools = makeTools(ctx);
  const scopeTopic = ctx.topicId && topicContent[ctx.topicId] ? ctx.topicId : undefined;

  return createUIMessageStream<TutorUIMessage>({
    // Required for resumed runs (after a quiz answer or approval): the response then
    // reuses the last assistant message id instead of creating a duplicate message.
    originalMessages: messages,
    execute: async ({ writer }) => {
      const w = (c: Parameters<typeof writer.write>[0]) => writer.write(c);

      const say = async (text: string) => {
        const tid = id("t");
        w({ type: "text-start", id: tid });
        for (const word of text.split(/(\S+\s*)/).filter(Boolean)) {
          w({ type: "text-delta", id: tid, delta: word });
          await sleep(18);
        }
        w({ type: "text-end", id: tid });
      };

      const finish = async (chips: string[]) => {
        if (chips.length) w({ type: "data-suggestions", data: { items: chips } });
        w({ type: "message-metadata", messageMetadata: { demo: true, tier: "fast", model: "demo-script" } });
      };

      w({ type: "start" });
      w({ type: "start-step" });

      /* ---- continuation after a client tool or an approval ---- */
      if (last?.role === "assistant") {
        for (const part of last.parts) {
          if (part.type === "tool-quiz" && part.state === "output-available") {
            const ok = part.output.correct;
            await say(
              ok
                ? `${part.output.attempts === 2 ? "Bra, du kom fram till det efter ledtråden." : "Rätt."} ${part.input.explanation} Vill du ha en svårare fråga på samma ämne?`
                : `Inte riktigt. Rätt svar är **${part.input.options[part.input.correctIndex]}**. ${part.input.explanation} Ska vi prova en till?`,
            );
            w({ type: "finish-step" });
            await finish(ok ? ["Ge mig en svårare", "Nästa ämne"] : ["Förklara det enklare", "En till fråga"]);
            w({ type: "finish" });
            return;
          }
          if (part.type === "tool-saveNote" && part.state === "approval-responded") {
            if (part.approval.approved) {
              const input = part.input;
              w({ type: "tool-output-available", toolCallId: part.toolCallId, output: { saved: true, topicId: input.topicId, topicName: TOPIC_NAMES[input.topicId] ?? input.topicId, text: input.text } });
              await say("Sparat i dina anteckningar.");
            } else {
              w({ type: "tool-output-denied", toolCallId: part.toolCallId });
              await say("Okej, jag sparar ingenting.");
            }
            w({ type: "finish-step" });
            await finish([]);
            w({ type: "finish" });
            return;
          }
          if (part.type === "tool-openTopic" && part.state === "output-available") {
            await say("Klart, jag öppnade ämnet.");
            w({ type: "finish-step" });
            await finish([]);
            w({ type: "finish" });
            return;
          }
        }
      }

      /* ---- lesson: structured blocks with a figure, a worked example and a callout ---- */
      if (/lektion|genomgång|visualis|djupare|steg för steg/.test(lower)) {
        await say("Jag räknar först ut matrisens egenvärden och bygger sedan genomgången.");
        const mat = { a: 3, b: 1, c: 1, d: 3 };
        const callA = id("call");
        w({ type: "tool-input-available", toolCallId: callA, toolName: "analyzeMatrix", input: { matrix: mat } });
        await sleep(300);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        w({ type: "tool-output-available", toolCallId: callA, output: await (tools.analyzeMatrix as any).execute({ matrix: mat }, { toolCallId: callA, messages: [] }) });
        w({ type: "finish-step" });
        w({ type: "start-step" });
        const callL = id("call");
        const lesson = {
          title: "Egenvektorer: riktningar som matrisen inte vrider",
          blocks: [
            { type: "heading", text: "Idén" },
            { type: "text", text: "En matris $A$ flyttar de flesta vektorer åt ett nytt håll. En **egenvektor** är en vektor som behåller sin riktning: $A\\mathbf{v}=\\lambda\\mathbf{v}$. Talet $\\lambda$ säger hur mycket den sträcks." },
            { type: "heading", text: "Visualisering: vad händer geometriskt?" },
            { type: "figure", matrix: mat, vectors: [{ x: 1, y: 1, label: "v" }], showEigenvectors: true, showUnitSquare: false, draggable: true, caption: "Dra v och se när Av hamnar på samma linje som v." },
            { type: "heading", text: "Så hittar du dem" },
            {
              type: "worked",
              title: "Egenvärden för A = [[3,1],[1,3]]",
              steps: [
                { text: "Egenvärden löser $\\det(A-\\lambda I)=0$.", tex: "\\det\\begin{pmatrix}3-\\lambda&1\\\\1&3-\\lambda\\end{pmatrix}=0" },
                { text: "Skriv ut determinanten.", tex: "(3-\\lambda)^2-1=0" },
                { text: "Lös för $\\lambda$: $3-\\lambda=\\pm 1$, så $\\lambda=2$ eller $\\lambda=4$." },
                { text: "För $\\lambda=4$ löser $(A-4I)\\mathbf{x}=\\mathbf{0}$ ut $\\mathbf{x}=(1,1)$. Kontrollera:", tex: "A\\begin{pmatrix}1\\\\1\\end{pmatrix}=\\begin{pmatrix}4\\\\4\\end{pmatrix}=4\\begin{pmatrix}1\\\\1\\end{pmatrix}" },
              ],
            },
            { type: "callout", tone: "remember", text: "Hitta först egenvärdena med $\\det(A-\\lambda I)=0$, sedan egenvektorerna med $(A-\\lambda I)\\mathbf{v}=\\mathbf{0}$." },
          ],
        };
        w({ type: "tool-input-available", toolCallId: callL, toolName: "showLesson", input: lesson });
        w({ type: "tool-output-available", toolCallId: callL, output: { shown: true, title: lesson.title } });
        w({ type: "finish-step" });
        w({ type: "start-step" });
        await say("Vill du testa själv på det här?");
        w({ type: "finish-step" });
        await finish(["Testa mig på det här", "Visa en matris utan egenvektorer"]);
        w({ type: "finish" });
        return;
      }

      /* ---- figure only ---- */
      if (/\brita\b|figur|geometr|\bdra\b|visa matris/.test(lower)) {
        await say("Så här ser det ut. Dra vektorn och se vad matrisen gör med den.");
        const toolCallId = id("call");
        w({ type: "tool-input-available", toolCallId, toolName: "showFigure", input: { matrix: { a: 2, b: 1, c: 1, d: 2 }, vectors: [{ x: 2, y: 1, label: "u" }], showEigenvectors: true, showUnitSquare: true, draggable: true, caption: "Enhetskvadraten blir en parallellogram vars area skalas med |det|." } });
        w({ type: "tool-output-available", toolCallId, output: { shown: true } });
        w({ type: "finish-step" });
        await finish(["Förklara egenvektorerna", "Testa mig"]);
        w({ type: "finish" });
        return;
      }

      /* ---- quiz: a CLIENT tool the learner answers in the chat ---- */
      if (/quiz|fråga mig|öva|testa mig|practi[cs]e|övningsfråga|en fråga/.test(lower)) {
        const tid = topicIn(prompt, ctx) ?? scopeTopic ?? "det";
        if (tid === "egenmed" || /egenv/.test(lower)) {
          // Eigenvalue question with a displayed matrix and a hint: wrong first answer = nudge + retry.
          await say("Här är en fråga. Svara direkt här i chatten.");
          const toolCallId = id("call");
          w({ type: "tool-input-start", toolCallId, toolName: "quiz" });
          await sleep(250);
          w({
            type: "tool-input-available",
            toolCallId,
            toolName: "quiz",
            input: {
              topicId: "egenmed",
              question: "Vi har matrisen $B$. Vad är egenvärdet som hör till egenvektorn $\\mathbf{v}=(0,1)$?",
              display: "B=\\begin{pmatrix}2&0\\\\0&5\\end{pmatrix}",
              options: ["$\\lambda=2$", "$\\lambda=5$", "$\\lambda=7$"],
              correctIndex: 1,
              hint: "Multiplicera matrisen med $(0,1)$ och se vilken faktor vektorn multipliceras med.",
              explanation: "$B\\begin{pmatrix}0\\\\1\\end{pmatrix}=\\begin{pmatrix}0\\\\5\\end{pmatrix}=5\\begin{pmatrix}0\\\\1\\end{pmatrix}$, så $\\lambda=5$.",
            },
          });
          w({ type: "finish-step" });
          await finish([]);
          w({ type: "finish" });
          return;
        }
        const qs = topicContent[tid]?.questions ?? topicContent.det.questions;
        const base = qs[Math.floor(Math.random() * qs.length)];
        // The authored content lists the right answer first; a real model would not.
        const order = base.options.map((_, i) => i).sort(() => Math.random() - 0.5);
        const q = { ...base, options: order.map((i) => base.options[i]), answer: order.indexOf(base.answer) };
        await say("Här är en fråga. Svara direkt här i chatten.");
        const toolCallId = id("call");
        w({ type: "tool-input-start", toolCallId, toolName: "quiz" });
        await sleep(250);
        w({ type: "tool-input-available", toolCallId, toolName: "quiz", input: { topicId: topicContent[tid] ? tid : "det", question: q.q, options: q.options, correctIndex: q.answer, explanation: q.explain, hint: "Gå tillbaka till definitionen och testa varje alternativ mot den." } });
        w({ type: "finish-step" });
        await finish([]);
        w({ type: "finish" });
        return;
      }

      /* ---- save a note: needs the learner's approval ---- */
      if (/spara|anteckning|\bsave\b|\bnote\b/.test(lower)) {
        const tid = scopeTopic ?? "det";
        const text = topicContent[tid].takeaways[0];
        await say("Jag kan spara det här i dina anteckningar. Bekräfta först:");
        const toolCallId = id("call");
        w({ type: "tool-input-available", toolCallId, toolName: "saveNote", input: { topicId: tid, text } });
        w({ type: "tool-approval-request", approvalId: id("appr"), toolCallId });
        w({ type: "finish-step" });
        await finish([]);
        w({ type: "finish" });
        return;
      }

      /* ---- open a topic: a CLIENT tool that navigates ---- */
      if (/öppna|gå till|\bopen\b|visa mig ämnet/.test(lower)) {
        const tid = topicIn(prompt, ctx) ?? scopeTopic;
        if (tid) {
          await say(`Öppnar **${TOPIC_NAMES[tid] ?? tid}**.`);
          const toolCallId = id("call");
          w({ type: "tool-input-available", toolCallId, toolName: "openTopic", input: { topicId: tid, mode: "theory" } });
          w({ type: "finish-step" });
          await finish([]);
          w({ type: "finish" });
          return;
        }
      }

      /* ---- default: grounded explanation with reasoning, server tools, sources ---- */
      const tid = scopeTopic ?? topicIn(prompt, ctx) ?? "det";
      const rid = id("r");
      w({ type: "reasoning-start", id: rid });
      for (const word of `Frågan gäller ${TOPIC_NAMES[tid] ?? tid}. Jag slår upp ämnet och letar efter tentauppgifter som testar det, så att svaret bygger på kursmaterialet.`.split(/(\S+\s*)/).filter(Boolean)) {
        w({ type: "reasoning-delta", id: rid, delta: word });
        await sleep(14);
      }
      w({ type: "reasoning-end", id: rid });

      const run = async (toolName: "searchTopics" | "getTopic" | "findExamParts", input: Record<string, unknown>) => {
        const toolCallId = id("call");
        w({ type: "tool-input-start", toolCallId, toolName });
        await sleep(160);
        w({ type: "tool-input-available", toolCallId, toolName, input });
        await sleep(380);
        // Same server tools the real agent uses, so the result shapes are real.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const output = await (tools[toolName] as any).execute(input, { toolCallId, messages: [] });
        w({ type: "tool-output-available", toolCallId, output });
        return output;
      };

      await run("searchTopics", { query: TOPIC_NAMES[tid]?.split(" ")[0] ?? prompt });
      await run("getTopic", { topicId: tid });
      const found = await run("findExamParts", { topicId: tid, limit: 2 });
      for (const p of (found as { parts: { examId: string; examTitle: string; exercise: number; part: string; href: string }[] }).parts) {
        w({ type: "source-url", sourceId: `${p.examId}-${p.exercise}${p.part}`, url: p.href, title: `${p.examTitle} · Uppgift ${p.exercise}${p.part}` });
      }

      // A real agent answers in a NEW step after its tool calls. Mirror that, or the
      // client would think a tool result is still waiting and resend the conversation.
      w({ type: "finish-step" });
      w({ type: "start-step" });
      await say(mockReply(prompt || "förklara", { topicId: tid }));
      void exams;
      w({ type: "finish-step" });
      await finish(["Ge mig en övningsfråga", "Förklara det enklare", "Visa tentauppgifter"]);
      w({ type: "finish" });
    },
    onError: () => "The demo tutor hit an error.",
  });
}
