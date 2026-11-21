import assert from "node:assert/strict";
import { test } from "node:test";

import { resolveStaleToolCalls } from "./sanitize.ts";

type Part = { type: string; state?: string; [k: string]: unknown };
type Msg = { role: string; parts: Part[] };


const user = (text: string): Msg => ({ role: "user", parts: [{ type: "text", text }] });

test("an unanswered quiz in an earlier message becomes a readable error", () => {
  const msgs: Msg[] = [
    user("quiz"),
    { role: "assistant", parts: [{ type: "text", text: "Här" }, { type: "tool-quiz", toolCallId: "c1", state: "input-available", input: { q: 1 } }] },
    user("något annat"),
  ];
  const out = resolveStaleToolCalls(msgs);
  const part = out[1].parts[1];
  assert.equal(part.state, "output-error");
  assert.match(String(part.errorText), /moved on/);
  assert.deepEqual(part.input, { q: 1 }); // input is kept
});

test("an unanswered approval loses its approval request", () => {
  const msgs: Msg[] = [
    { role: "assistant", parts: [{ type: "tool-saveNote", toolCallId: "c2", state: "approval-requested", input: {}, approval: { id: "a1" } }] },
    user("hej"),
  ];
  const part = resolveStaleToolCalls(msgs)[0].parts[0];
  assert.equal(part.state, "output-error");
  assert.equal("approval" in part, false);
});

test("answered tool calls and the LAST message are untouched", () => {
  const answered: Msg = { role: "assistant", parts: [{ type: "tool-quiz", toolCallId: "c3", state: "output-available", output: { ok: true } }] };
  const live: Msg = { role: "assistant", parts: [{ type: "tool-quiz", toolCallId: "c4", state: "input-available", input: {} }] };
  const out = resolveStaleToolCalls([user("a"), answered, user("b"), live]);
  assert.equal(out[1], answered); // same reference: nothing changed
  assert.equal(out[3], live);
  assert.equal(out[3].parts[0].state, "input-available");
});

test("messages without tool parts are returned as-is", () => {
  const m: Msg[] = [user("hej"), { role: "assistant", parts: [{ type: "text", text: "hej" }] }, user("igen")];
  const out = resolveStaleToolCalls(m);
  assert.equal(out[1], m[1]);
});
