"use client";

import { useMemo, useSyncExternalStore } from "react";

import type { MasteryState } from "@/components/mastery-badge";
import { courseEdges, courses, getCourse, TOPIC_NAMES, type Edge, type TopicProposal } from "@/mock";

/* -------------------------------------------------------------------------
 * Types
 * ----------------------------------------------------------------------- */

export type Session = {
  id: string;
  course: string;
  topic: string;
  kind: "theory" | "practice";
  /** ISO timestamp */
  at: string;
  min: number;
  correct?: number;
  total?: number;
  /** indexes of questions answered wrong (for review) */
  wrong?: number[];
};

export type SolvedStatus = "solved" | "unsure" | "stuck";

export type AcceptedTopic = {
  id: string;
  name: string;
  parent: string;
  module: number;
  course: string;
};

type Persisted = {
  v: 1;
  course: string;
  sessions: Session[];
  notes: Record<string, string>;
  generated: string[];
  solved: Record<string, SolvedStatus>;
  accepted: AcceptedTopic[];
  rejected: string[];
};

export type TopicStatus = "new" | "due" | "overdue" | "scheduled";

export type TopicScore = {
  id: string;
  started: boolean;
  status: TopicStatus;
  /** 0-100 */
  mastery: number;
  /** days until due (negative = overdue), null when never studied */
  days: number | null;
  last: string | null;
  sessions: number;
  theory: number;
  practice: number[];
  /** weighted recent practice average, 0-1 */
  base: number;
};

/* -------------------------------------------------------------------------
 * Dates (local-day keys)
 * ----------------------------------------------------------------------- */

const pad = (n: number) => (n < 10 ? "0" : "") + n;
export const dkey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseKey = (k: string) => {
  const [y, m, d] = k.split("-").map(Number);
  return new Date(y, m - 1, d);
};
export const addDays = (k: string, n: number) => {
  const d = parseKey(k);
  d.setDate(d.getDate() + n);
  return dkey(d);
};
export const diffDays = (a: string, b: string) => {
  const A = parseKey(a);
  const B = parseKey(b);
  return Math.round((Date.UTC(B.getFullYear(), B.getMonth(), B.getDate()) - Date.UTC(A.getFullYear(), A.getMonth(), A.getDate())) / 864e5);
};
export const today = () => dkey(new Date());

/* -------------------------------------------------------------------------
 * Scheduling + mastery (ported from the Fourier dashboard mock)
 * Review ladder in days; a score >= 80% climbs, < 50% resets.
 * ----------------------------------------------------------------------- */

const LADDER = [3, 7, 16, 35, 75, 160];
const grow = (i: number) => LADDER.find((s) => s > i) ?? i * 2;

export function computeScores(sessions: Session[], ids: string[], now = today()): Record<string, TopicScore> {
  const out: Record<string, TopicScore & { interval: number; reps: number }> = {};
  for (const id of ids) {
    out[id] = { id, started: false, status: "new", mastery: 0, days: null, last: null, sessions: 0, theory: 0, practice: [], base: 0, interval: 0, reps: 0 };
  }
  [...sessions]
    .sort((a, b) => (a.at < b.at ? -1 : 1))
    .forEach((x) => {
      const t = out[x.topic];
      if (!t) return;
      const day = dkey(new Date(x.at));
      const q = x.kind === "practice" && x.total ? (x.correct ?? 0) / x.total : null;
      t.sessions++;
      t.started = true;
      if (q === null) t.theory++;
      else t.practice.push(q);
      if (!t.last) {
        t.interval = LADDER[0];
        t.reps = 0;
      } else if (day === t.last) {
        if (q !== null && q < 0.5) {
          t.interval = LADDER[0];
          t.reps = 0;
        }
      } else if (q === null) {
        /* re-reading keeps the interval */
      } else if (q >= 0.8) {
        t.reps++;
        t.interval = grow(t.interval);
      } else if (q < 0.5) {
        t.interval = LADDER[0];
        t.reps = 0;
      }
      t.last = day;
    });

  for (const id of ids) {
    const t = out[id];
    if (!t.last) continue;
    const due = addDays(t.last, t.interval);
    t.days = diffDays(now, due);
    t.status = t.days > 0 ? "scheduled" : t.days === 0 ? "due" : "overdue";
    let base: number;
    if (t.practice.length) {
      const p = t.practice.slice(-3);
      let w = 0;
      let s = 0;
      p.forEach((v, i) => {
        const wt = i + 1 + (3 - p.length);
        s += v * wt;
        w += wt;
      });
      base = s / w;
    } else base = 0.15;
    let m = base * (0.6 + 0.1 * Math.min(t.reps, 4));
    if (t.days < 0) m *= Math.max(0.6, 1 + 0.02 * t.days);
    t.mastery = Math.round(m * 100);
    t.base = base;
  }
  return out;
}

export function masteryState(s: TopicScore | undefined): MasteryState {
  if (!s || !s.started) return "not-started";
  if (s.mastery >= 80) return "mastered";
  if (s.mastery >= 50) return "practicing";
  return "learning";
}

export function dueLabel(s: TopicScore): string {
  if (!s.started || s.days === null) return "Not started";
  if (s.status === "overdue") return `Overdue ${-s.days}d`;
  if (s.status === "due") return "Due today";
  return s.days === 1 ? "Review tomorrow" : `Review in ${s.days}d`;
}

/* -------------------------------------------------------------------------
 * Recommendations
 * ----------------------------------------------------------------------- */

export type Recommendation = {
  topic: string;
  kind: "theory" | "practice";
  why: string;
  pri: number;
};

export function recommend(
  topicIds: string[],
  edges: Edge[],
  scores: Record<string, TopicScore>,
  names: (id: string) => string,
): Recommendation[] {
  const prereqs = (id: string) => edges.filter((e) => e.to === id).map((e) => e.from);
  const out: Recommendation[] = [];
  for (const id of topicIds) {
    const s = scores[id];
    if (!s || s.status === "due" || s.status === "overdue") continue;
    if (s.started && !s.practice.length) out.push({ topic: id, kind: "practice", pri: 1, why: "You read the theory. Test yourself to lock it in." });
    else if (s.started && s.base < 0.7) out.push({ topic: id, kind: "practice", pri: 0, why: `Your last scores average ${Math.round(s.base * 100)}%. Another round will help.` });
  }
  for (const id of topicIds) {
    const s = scores[id];
    if (!s || s.started) continue;
    const pre = prereqs(id);
    if (!pre.every((p) => scores[p]?.started)) continue;
    out.push({
      topic: id,
      kind: "theory",
      pri: pre.length ? 3 : 2,
      why: pre.length ? `Builds on ${pre.map(names).join(" and ")}, which you have studied.` : "No prerequisites. A good place to start.",
    });
  }
  out.sort((a, b) => a.pri - b.pri || topicIds.indexOf(a.topic) - topicIds.indexOf(b.topic));
  return out;
}

/* -------------------------------------------------------------------------
 * Seed (relative to "now" so the demo always looks lived-in)
 * ----------------------------------------------------------------------- */

function seed(): Persisted {
  const now = new Date();
  const at = (daysAgo: number, hour = 19) => {
    const d = new Date(now);
    d.setDate(d.getDate() - daysAgo);
    d.setHours(hour, 10, 0, 0);
    return d.toISOString();
  };
  let n = 0;
  const s = (topic: string, kind: Session["kind"], daysAgo: number, min: number, correct?: number, total?: number): Session => ({
    id: `seed-${n++}`,
    course: "SF1624",
    topic,
    kind,
    at: at(daysAgo, 17 + (n % 4)),
    min,
    correct,
    total,
  });
  return {
    v: 1,
    course: "SF1624",
    sessions: [
      s("gauss", "theory", 12, 14),
      s("gauss", "practice", 11, 8, 3, 4),
      s("gauss", "practice", 4, 7, 4, 4),
      s("gauss", "practice", 1, 6, 4, 4),
      s("det", "theory", 6, 11),
      s("det", "practice", 5, 7, 3, 4),
      s("vektorkalkyl", "theory", 3, 12),
      s("invers", "theory", 1, 9),
      s("komplexrak", "theory", 4, 8),
      s("komplexrak", "practice", 4, 5, 2, 4),
      s("rang", "theory", 2, 7),
      s("rang", "practice", 2, 4, 3, 4),
      s("losningsmangd", "theory", 9, 10),
      s("losningsmangd", "practice", 8, 6, 2, 4),
    ],
    notes: { det: "Kom ihåg: $\\det(cA)=c^n\\det A$, inte $c\\det A$." },
    generated: [],
    solved: {},
    accepted: [],
    rejected: [],
  };
}

/* -------------------------------------------------------------------------
 * External store (localStorage). Server + first client render see `null`,
 * so there is no hydration mismatch; components render skeletons until ready.
 * ----------------------------------------------------------------------- */

const KEY = "kollin-study-v1";
let state: Persisted | null = null;
const listeners = new Set<() => void>();

function load(): Persisted {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const p = JSON.parse(raw) as Persisted;
      if (p && p.v === 1 && Array.isArray(p.sessions)) return p;
    }
  } catch {
    /* ignore, fall through to seed */
  }
  return seed();
}

function emit() {
  listeners.forEach((l) => l());
}

function commit(next: Persisted) {
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable: state still lives in memory for this tab */
  }
  emit();
}

function subscribe(cb: () => void) {
  if (!state) state = load();
  listeners.add(cb);
  return () => listeners.delete(cb);
}
const getSnapshot = () => state;
const getServerSnapshot = () => null;

const uid = () => Math.random().toString(36).slice(2, 10);

export const actions = {
  record(s: Omit<Session, "id" | "at"> & { id?: string }) {
    if (!state) return;
    const id = s.id ?? uid();
    const sessions = state.sessions.filter((x) => x.id !== id);
    sessions.push({ ...s, id, at: new Date().toISOString() });
    commit({ ...state, sessions });
  },
  remove(id: string) {
    if (state) commit({ ...state, sessions: state.sessions.filter((x) => x.id !== id) });
  },
  setCourse(code: string) {
    if (state) commit({ ...state, course: code });
  },
  saveNote(topic: string, text: string) {
    if (!state) return;
    const notes = { ...state.notes };
    if (text.trim()) notes[topic] = text;
    else delete notes[topic];
    commit({ ...state, notes });
  },
  markGenerated(topic: string) {
    if (state && !state.generated.includes(topic)) commit({ ...state, generated: [...state.generated, topic] });
  },
  acceptProposal(p: TopicProposal, course: string) {
    if (!state || state.accepted.some((a) => a.id === p.id)) return;
    commit({ ...state, accepted: [...state.accepted, { id: p.id, name: p.name, parent: p.parent, module: p.module, course }] });
  },
  rejectProposal(id: string) {
    if (state && !state.rejected.includes(id)) commit({ ...state, rejected: [...state.rejected, id] });
  },
  undoProposal(id: string) {
    if (!state) return;
    commit({ ...state, accepted: state.accepted.filter((a) => a.id !== id), rejected: state.rejected.filter((r) => r !== id) });
  },
  /** Self-assess a sub-exercise. Replaces any earlier assessment of it. */
  setSolved(course: string, subId: string, topics: string[], status: SolvedStatus | null) {
    if (!state) return;
    const solved = { ...state.solved };
    if (status) solved[subId] = status;
    else delete solved[subId];
    const prefix = `exam:${subId}:`;
    const sessions = state.sessions.filter((x) => !x.id.startsWith(prefix));
    if (status) {
      const [correct, total] = status === "solved" ? [1, 1] : status === "unsure" ? [1, 2] : [0, 1];
      for (const topic of topics) {
        sessions.push({ id: `${prefix}${topic}`, course, topic, kind: "practice", at: new Date().toISOString(), min: 5, correct, total });
      }
    }
    commit({ ...state, solved, sessions });
  },
  reset() {
    commit(seed());
  },
};

/* -------------------------------------------------------------------------
 * Hook
 * ----------------------------------------------------------------------- */

export function useStudy() {
  const s = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const derived = useMemo(() => {
    if (!s) return null;
    const accepted = s.accepted;
    const names: Record<string, string> = { ...TOPIC_NAMES };
    for (const a of accepted) names[a.id] = a.name;
    const ids = Object.keys(names);
    const scores = computeScores(s.sessions, ids);
    const acceptedEdges: Edge[] = accepted.map((a) => ({ from: a.parent, to: a.id }));
    return { names, scores, acceptedEdges };
  }, [s]);

  const course = s ? getCourse(s.course) ?? courses[0] : courses[0];

  return {
    ready: s !== null && derived !== null,
    state: s,
    course,
    names: derived?.names ?? TOPIC_NAMES,
    scores: derived?.scores ?? {},
    acceptedEdges: derived?.acceptedEdges ?? [],
    nameOf: (id: string) => derived?.names[id] ?? TOPIC_NAMES[id] ?? id,
    actions,
  };
}

/** Topics of a course, including AI-proposed topics the learner accepted. */
export function topicsOf(code: string, accepted: AcceptedTopic[]) {
  const c = getCourse(code);
  if (!c) return [];
  const base = c.topics.map((t) => ({ id: t.topicId, module: t.module, exercises: t.exercises, isNew: false }));
  const extra = accepted
    .filter((a) => a.course === code)
    .map((a) => ({ id: a.id, module: a.module, exercises: 0, isNew: true }));
  return [...base, ...extra];
}

export function edgesOf(code: string, accepted: AcceptedTopic[]): Edge[] {
  const ids = new Set(topicsOf(code, accepted).map((t) => t.id));
  return courseEdges(ids, accepted.filter((a) => a.course === code).map((a) => ({ from: a.parent, to: a.id })));
}
