# AI layer

The tutor chat is built on **AI SDK 7** (`ai`, `@ai-sdk/react`), models through the **Vercel AI Gateway**, and UI from the **AI Elements** registry (copied into `src/components/ai-elements`, so we own it).

## Demo mode vs real models

`POST /api/chat` checks for Gateway credentials (`AI_GATEWAY_API_KEY`, or the OIDC token Vercel injects).

- **No credentials:** `src/lib/ai/demo.ts` answers with a script. It emits the *same stream parts* as the real tutor (reasoning, server tools, a client quiz, an approval request, sources, follow-up chips), so every piece of UI works without a key.
- **Credentials present:** `src/lib/ai/tutor.ts` runs the real agent. Verified end to end on 2026-11-21 against free-tier models: routing, server tools, grounded sources, a client quiz round trip, follow-up chips and usage metadata. **Not yet verified:** the `saveNote` approval flow and `web_search` on a real model, and anything on Claude models.

To switch on: copy `.env.example` to `.env.local`, set `AI_GATEWAY_API_KEY`, run `pnpm ai:models` and put the exact model IDs in `AI_MODEL_*`. The code defaults in `src/lib/ai/models.ts` are real Gateway IDs (`anthropic/claude-haiku-5.5`, `anthropic/claude-sonnet-5.5`) but those are **locked on the Gateway free tier**: with a free-tier key every Anthropic call returns 403 `RestrictedModelsError` until you buy credits. Until then override the tiers with free-tier models (46 of ~90 small models worked when probed, e.g. `google/gemini-2.5-flash`, `openai/gpt-5-mini`, `deepseek/deepseek-v4-flash`, `alibaba/qwen3.7-flash`).

## Visuals (figures, lessons, worked examples)

The tutor can *show* things, not just say them. The rule: **the model gives intent, the app computes the geometry.**

- `showFigure` takes a 2x2 matrix + vectors. `src/lib/math/linalg.ts` computes every image and eigen-direction (unit-tested), `MatrixFigure` draws it with Mafs (pinned `0.21.0`, one maintainer, only `matrix-figure.tsx` imports it). Optional draggable vector with a live "eigenvector" badge. A text readout (det, trace, eigenvalues) is always shown, so figures are accessible.
- `analyzeMatrix` returns computed facts to the MODEL so lesson text quotes real numbers. Instructions require calling it before writing about a specific matrix.
- `showLesson` takes typed blocks: heading, text, formula, figure, worked example (revealed step by step), callout. Rendered by `LessonView`, validated block by block while streaming.
- `quiz` now has `display` (a formula under the question), a required `hint`, and one retry after a wrong first answer (credit: right first time 1/1, right after the hint 1/2, wrong 0/1). A question that mentions a matrix without showing one is rejected by the schema so the model fixes it.

**Models get tool shapes slightly wrong.** A real run failed `showLesson` validation 7 times (85k tokens) because the model wrote `text` for text blocks, `formula` for formulas and invented block types (`remember`, `workedExample`). Fixes: uniform field names in the schema, `src/lib/ai/normalize.ts` (shared, unit-tested) repairs common variants, and the agent's `repairToolCall` hook applies it on the server before a retry would be needed. After the fix the same request succeeded first try with 3.7k tokens in.

## What cheap models got wrong (why routing is conservative)

On the `fast` tier a small model invented a topic id (`126292`) and gave a misleading explanation ("determinant is additive over rows"). Fixes: the router only picks `fast` for greetings, navigation and one-line definitions; tools return a correctable error for unknown ids; instructions say ids are slugs and name the open topic's id. Measure real quality with an eval before trusting any cheap tier.

## One request, step by step

1. **Route** (`routeRequest`): a tiny model classifies the question as `fast` or `deep` and says whether it needs the web. 5 s timeout; any failure falls back to `deep`, so routing can only save money.
2. **Tutor** (`ToolLoopAgent`, max 8 steps) on the chosen tier, with tools:
   - server: `searchTopics`, `getTopic`, `findExamParts` (grounding in the course material)
   - client (the browser fulfils them): `quiz` (interactive question), `openTopic` (navigation)
   - approval: `saveNote` pauses until the learner approves (`toolApproval`)
   - Gateway tool: `web_search` (Perplexity, executed by the Gateway), only active when the router asks
3. **Sources:** exam parts the tutor looked at become clickable citations.
4. **Chips:** the tiny model writes 2-3 follow-up prompts after the answer (never blocks it).
5. **Metadata:** tier, model, token usage and the Gateway `generationId` ride on the message (look up exact cost with `gateway.getGenerationInfo`).

Every call carries Gateway `tags` (task, tier, course), an anonymous `user` id, `disallowPromptTraining`, optional cross-model `models` fallbacks (`AI_FALLBACK_MODELS`) and optional `zeroDataRetention` (`AI_ZDR=1`, paid add-on).

## Rules that bit us

- Resumed runs (after a quiz answer or approval) need `originalMessages` on the server stream, or each resume creates a duplicate assistant message.
- Only **client** tools may trigger an automatic resend (`needsResume` in `ai-context.tsx`). Letting a finished server tool trigger it loops forever.
- Keep tool calls and the final answer in separate steps; the demo mirrors this.
- `GatewayProviderOptions` must be applied with `satisfies`, not an annotation, or `providerOptions` will not type-check.
- KaTeX must be one version: Streamdown renders with 0.16, so our CSS and `Rich` use 0.16 too.
- Sheet width/max-width overrides must use the sheet's own `data-[side=right]:` variant.

## Not built yet

Machine-checking model-written quizzes (verify eigenvalue claims with `analyzeMatrix` before showing), figures beyond 2x2 matrices (function graphs, 3D), server-side history (today: localStorage), real rate limiting (today: in-memory per instance), embeddings for topic search (today: keyword match), a model eval before trusting a cheap tier, durable generation jobs (Workflow), telemetry (`@ai-sdk/otel`).
