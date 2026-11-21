import type { GatewayProviderOptions } from "@ai-sdk/gateway";

/**
 * One place that decides which model does which job.
 *
 * Model IDs are plain AI Gateway strings ("creator/model"). They are
 * UNVERIFIED defaults: run `pnpm ai:models` (needs a Gateway key) to list what
 * the Gateway actually serves, then override with env vars. Nothing else in
 * the app names a model, so swapping a tier never touches feature code.
 *
 * Tiers:
 *  - router : tiny + cheap. Classifies the request, writes follow-up chips.
 *  - fast   : cheap. Simple questions that need little reasoning.
 *  - deep   : strong. Multi-step explanations, math, tool use.
 */
export type Tier = "router" | "fast" | "deep";

export const MODELS: Record<Tier, string> = {
  router: process.env.AI_MODEL_ROUTER ?? "anthropic/claude-haiku-5.5",
  fast: process.env.AI_MODEL_FAST ?? "anthropic/claude-haiku-5.5",
  deep: process.env.AI_MODEL_DEEP ?? "anthropic/claude-sonnet-5.5",
};

/** Comma separated Gateway IDs tried in order if the primary model cannot serve a request. */
const fallbacks = (process.env.AI_FALLBACK_MODELS ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

/**
 * True when the app can reach the Gateway. Locally that is an API key; on
 * Vercel the OIDC token is injected automatically. Without it the chat runs
 * in demo mode (scripted replies through the SAME stream format).
 */
export const hasGateway = () => Boolean(process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN);

/**
 * Per-request Gateway options.
 *  - tags/user make spend reportable per feature and per (anonymous) learner.
 *  - models adds cross-model fallbacks on top of the Gateway's built-in provider retries.
 *  - disallowPromptTraining: never route student chats to providers that train on prompts.
 *  - zeroDataRetention: opt in with AI_ZDR=1 (restricts routing to providers that support it,
 *    and is a paid add-on; see the Gateway pricing page).
 */
export function gatewayOptions(args: { tier: Tier; task: string; course?: string; userId: string }) {
  // `satisfies` (not an annotation): keeps the literal JSON-compatible type that
  // `providerOptions` requires, while still type-checking every Gateway key.
  const gateway = {
    tags: ["kollin", args.task, `tier:${args.tier}`, ...(args.course ? [`course:${args.course}`] : [])],
    user: args.userId,
    ...(fallbacks.length ? { models: fallbacks } : {}),
    disallowPromptTraining: true,
    ...(process.env.AI_ZDR === "1" ? { zeroDataRetention: true } : {}),
  } satisfies GatewayProviderOptions;
  return { gateway };
}
