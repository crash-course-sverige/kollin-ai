#!/usr/bin/env node
/**
 * Lists the models the AI Gateway serves, with pricing, so tier IDs in
 * src/lib/ai/models.ts can be verified instead of guessed.
 *
 *   AI_GATEWAY_API_KEY=... pnpm ai:models [filter]
 *
 * (On a linked Vercel project, `vercel env pull` provides an OIDC token instead.)
 */
import { gateway } from "ai";

const filter = (process.argv[2] ?? "").toLowerCase();
const { models } = await gateway.getAvailableModels();
const per1M = (v) => (v == null ? "   n/a" : `$${(Number(v) * 1e6).toFixed(2)}`.padStart(7));

const rows = models
  .filter((m) => !filter || m.id.toLowerCase().includes(filter) || (m.name ?? "").toLowerCase().includes(filter))
  .sort((a, b) => a.id.localeCompare(b.id));

console.log(`${rows.length} model(s)  (price per 1M tokens: input / output)\n`);
for (const m of rows) {
  console.log(`${m.id.padEnd(48)} ${per1M(m.pricing?.input)} / ${per1M(m.pricing?.output)}`);
}

try {
  const credits = await gateway.getCredits();
  console.log(`\nTeam credits: balance ${credits.balance}, used ${credits.total_used}`);
} catch {
  /* credits endpoint is optional */
}
