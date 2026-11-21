"use client";

import { useChat } from "@ai-sdk/react";
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithApprovalResponses,
  lastAssistantMessageIsCompleteWithToolCalls,
  type ChatStatus,
} from "ai";
import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";

import type { LearnerState } from "@/lib/ai/tools";
import type { TutorUIMessage } from "@/lib/ai/types";
import { actions, useStudy } from "@/lib/study";

export type AiScope = {
  /** short label shown in the context chip, e.g. "Determinant · SF1624" */
  label: string;
  topicId?: string;
  course?: string;
};

type Ctx = {
  open: boolean;
  setOpen: (v: boolean) => void;
  scope: AiScope | null;
  setScope: (s: AiScope | null) => void;
  messages: TutorUIMessage[];
  status: ChatStatus;
  error: Error | undefined;
  busy: boolean;
  /** Open the panel and send a prompt right away. */
  ask: (prompt: string, scope?: AiScope) => void;
  stop: () => void;
  regenerate: () => void;
  clear: () => void;
  addToolOutput: ReturnType<typeof useChat<TutorUIMessage>>["addToolOutput"];
  addToolApprovalResponse: ReturnType<typeof useChat<TutorUIMessage>>["addToolApprovalResponse"];
};

const AiCtx = createContext<Ctx | null>(null);

export function useAi() {
  const c = useContext(AiCtx);
  if (!c) throw new Error("useAi must be used inside <AiProvider>");
  return c;
}

/** Register what the user is looking at, so the tutor answers in context. */
export function useAiScope(scope: AiScope | null) {
  const { setScope } = useAi();
  const key = scope ? `${scope.label}|${scope.topicId ?? ""}|${scope.course ?? ""}` : "";
  useEffect(() => {
    setScope(scope);
    return () => setScope(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, setScope]);
}

/**
 * Browser-side "live" values the request body needs at SEND time. A plain
 * module object (updated from effects) rather than refs: the transport is
 * created once outside React, and only ever reads this inside the request
 * callback, in the browser. Nothing here is shared between users on the server
 * because nothing writes to it there.
 */
const live: { scope: AiScope | null; course: string; learner: LearnerState; userId: string } = {
  scope: null,
  course: "SF1624",
  learner: { mastery: {}, due: [], accepted: [] },
  userId: "anonymous",
};

const transport = new DefaultChatTransport<TutorUIMessage>({
  api: "/api/chat",
  prepareSendMessagesRequest: ({ id, messages }) => ({
    body: { id, messages, scope: live.scope ?? undefined, learner: live.learner, userId: live.userId },
  }),
});

/** Tools the browser fulfils. Only these should make the client resume the run by itself. */
const CLIENT_TOOLS = new Set(["tool-quiz", "tool-openTopic"]);

/**
 * Resume automatically when the learner answered a client tool or responded to
 * an approval. Server tools finish inside the same request, so a completed
 * server tool must never trigger a resend (that would loop forever).
 */
function needsResume(o: { messages: TutorUIMessage[] }) {
  if (lastAssistantMessageIsCompleteWithApprovalResponses(o)) return true;
  if (!lastAssistantMessageIsCompleteWithToolCalls(o)) return false;
  const last = o.messages.at(-1);
  if (last?.role !== "assistant") return false;
  const lastStepStart = last.parts.map((p) => p.type).lastIndexOf("step-start");
  return last.parts.slice(lastStepStart + 1).some((p) => CLIENT_TOOLS.has(p.type));
}

const HISTORY_KEY = "kollin-chat-v1";
const UID_KEY = "kollin-uid";
const MAX_SAVED = 40;

export function AiProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const study = useStudy();
  const [open, setOpen] = useState(false);
  const [scope, setScope] = useState<AiScope | null>(null);

  const restored = useRef(false);
  const applied = useRef(new Set<string>());

  useEffect(() => {
    live.scope = scope;
  }, [scope]);

  useEffect(() => {
    if (!study.state) return;
    live.course = study.state.course;
    const mastery: Record<string, number> = {};
    const due: string[] = [];
    for (const [id, s] of Object.entries(study.scores)) {
      if (s.started) mastery[id] = s.mastery;
      if (s.status === "due" || s.status === "overdue") due.push(id);
    }
    live.learner = { mastery, due, accepted: study.state.accepted };
  }, [study.state, study.scores]);

  const { messages, sendMessage, status, error, stop, regenerate, setMessages, addToolOutput, addToolApprovalResponse } = useChat<TutorUIMessage>({
    transport,
    // Resume the run automatically once the learner answered a quiz or approved/denied a tool.
    sendAutomaticallyWhen: needsResume,
    // Client tools: the browser fulfils them. Do not await addToolOutput inside onToolCall.
    onToolCall: ({ toolCall }) => {
      if (toolCall.dynamic) return;
      if (toolCall.toolName === "openTopic") {
        const { topicId, mode } = toolCall.input as { topicId: string; mode?: "theory" | "practice" };
        const course = live.scope?.course ?? live.course;
        router.push(`/app/course/${course}/topic/${topicId}${mode === "practice" ? "?mode=practice" : ""}`);
        void addToolOutput({ tool: "openTopic", toolCallId: toolCall.toolCallId, output: { opened: true } });
      }
    },
  });

  /* ---- identity + history ---- */
  useEffect(() => {
    try {
      let uid = localStorage.getItem(UID_KEY);
      if (!uid) {
        uid = `u_${crypto.randomUUID().slice(0, 12)}`;
        localStorage.setItem(UID_KEY, uid);
      }
      live.userId = uid;

      const raw = localStorage.getItem(HISTORY_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as TutorUIMessage[];
        if (Array.isArray(saved) && saved.length) {
          // Anything already applied in a past session must not be applied twice.
          for (const m of saved) for (const p of m.parts) if (p.type === "tool-saveNote") applied.current.add(p.toolCallId);
          setMessages(saved);
        }
      }
    } catch {
      /* storage unavailable or corrupt: start empty */
    }
    restored.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!restored.current || status === "streaming" || status === "submitted") return;
    try {
      if (messages.length === 0) localStorage.removeItem(HISTORY_KEY);
      else localStorage.setItem(HISTORY_KEY, JSON.stringify(messages.slice(-MAX_SAVED)));
    } catch {
      /* quota or private mode: history just will not persist */
    }
  }, [messages, status]);

  /* ---- an approved saveNote ran on the server; the browser owns the notebook, so apply it here ---- */
  useEffect(() => {
    for (const m of messages) {
      for (const p of m.parts) {
        if (p.type === "tool-saveNote" && p.state === "output-available" && !applied.current.has(p.toolCallId)) {
          applied.current.add(p.toolCallId);
          const prev = study.state?.notes[p.output.topicId];
          actions.saveNote(p.output.topicId, prev ? `${prev}\n${p.output.text}` : p.output.text);
          toast.success(`Saved to notes: ${p.output.topicName}`);
        }
      }
    }
  }, [messages, study.state?.notes]);

  const busy = status === "submitted" || status === "streaming";

  const ask = useCallback(
    (prompt: string, override?: AiScope) => {
      const text = prompt.trim();
      if (!text || busy) return;
      setOpen(true);
      if (override) live.scope = override;
      void sendMessage({ text });
    },
    [busy, sendMessage],
  );

  const clear = useCallback(() => {
    stop();
    setMessages([]);
  }, [stop, setMessages]);

  const value = useMemo<Ctx>(
    () => ({ open, setOpen, scope, setScope, messages, status, error, busy, ask, stop, regenerate: () => void regenerate(), clear, addToolOutput, addToolApprovalResponse }),
    [open, scope, messages, status, error, busy, ask, stop, regenerate, clear, addToolOutput, addToolApprovalResponse],
  );
  return <AiCtx.Provider value={value}>{children}</AiCtx.Provider>;
}
