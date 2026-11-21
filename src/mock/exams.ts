import { TOPIC_NAMES } from "./topics";
import type { Exam, TopicProposal } from "./types";

/**
 * Example exam (authored for this prototype, NOT a real KTH exam). It shows
 * the exam → exercise → sub-exercise → topics structure the AI would extract.
 */
const authoredExams: Exam[] = [
  {
    id: "sf1624-exempel",
    course: "SF1624",
    title: "Exempeltenta",
    date: "2025-01-08",
    proposals: [
      {
        id: "spektralsatsen",
        name: "Spektralsatsen",
        parent: "symm",
        module: 5,
        subs: ["u4c"],
        reason:
          "Uppgifter som ber dig visa att en matris är ortogonalt diagonaliserbar återkommer, men inget ämne i grafen täcker själva satsen.",
      },
    ],
    exercises: [
      {
        id: "u1",
        number: 1,
        title: "Linjärt ekvationssystem",
        points: 6,
        intro: "Betrakta systemet $x+2y+z=1,\\ 2x+4y+3z=4,\\ x+2y+2z=3$.",
        subs: [
          {
            id: "u1a",
            label: "a",
            points: 3,
            text: "Lös systemet.",
            topics: ["gauss", "losningsmangd"],
            hints: [
              "Subtrahera 2 gånger rad 1 från rad 2, och rad 1 från rad 3.",
              "Du får $z=2$ i båda raderna. Vilken variabel blir fri?",
            ],
            answer: "$(x,y,z)=(-1-2t,\\ t,\\ 2)$ för $t\\in\\mathbb{R}$.",
          },
          {
            id: "u1b",
            label: "b",
            points: 3,
            text: "Bestäm rangen för koefficientmatrisen.",
            topics: ["rang", "losbarhet"],
            hints: [
              "Rangen är antalet ledande element i trappstegsform.",
              "Efter eliminering återstår två nollskilda rader.",
            ],
            answer: "$\\operatorname{rang}A=2$.",
          },
        ],
      },
      {
        id: "u2",
        number: 2,
        title: "Determinant och invers",
        points: 6,
        intro: "Låt $A=\\begin{pmatrix}1&2&0\\\\0&3&1\\\\1&0&2\\end{pmatrix}$.",
        subs: [
          {
            id: "u2a",
            label: "a",
            points: 3,
            text: "Beräkna $\\det A$.",
            topics: ["det"],
            hints: [
              "Utveckla längs första raden.",
              "$1\\cdot(3\\cdot2-1\\cdot0)-2\\cdot(0\\cdot2-1\\cdot1)+0$.",
            ],
            answer: "$\\det A=8$.",
          },
          {
            id: "u2b",
            label: "b",
            points: 3,
            text: "Är $A$ inverterbar? Motivera.",
            topics: ["det", "invers"],
            hints: ["Vad säger determinantens värde om inverterbarhet?"],
            answer: "Ja. Eftersom $\\det A=8\\neq0$ är $A$ inverterbar.",
          },
        ],
      },
      {
        id: "u3",
        number: 3,
        title: "Linjär avbildning",
        points: 8,
        intro: "Avbildningen $T:\\mathbb{R}^3\\to\\mathbb{R}^3$ ges av $T(x,y,z)=(x+y,\\ y+z,\\ x-z)$.",
        subs: [
          {
            id: "u3a",
            label: "a",
            points: 2,
            text: "Bestäm avbildningsmatrisen i standardbasen.",
            topics: ["avbmatris"],
            hints: ["Kolonnerna är bilderna av basvektorerna $\\mathbf{e}_1,\\mathbf{e}_2,\\mathbf{e}_3$."],
            answer: "$\\begin{pmatrix}1&1&0\\\\0&1&1\\\\1&0&-1\\end{pmatrix}$.",
          },
          {
            id: "u3b",
            label: "b",
            points: 3,
            text: "Bestäm en bas för kärnan.",
            topics: ["kerim", "gauss"],
            hints: [
              "Lös $A\\mathbf{x}=\\mathbf{0}$ med Gausseliminering.",
              "Du får $y=-x$ och $z=x$, med $x$ fri.",
            ],
            answer: "En bas är $\\{(1,-1,1)\\}$, så $\\dim\\ker T=1$.",
          },
          {
            id: "u3c",
            label: "c",
            points: 3,
            text: "Vad är dimensionen av bilden?",
            topics: ["kerim", "dim"],
            hints: ["Använd dimensionssatsen med resultatet från b."],
            answer: "$\\dim\\operatorname{Im}T=3-1=2$.",
          },
        ],
      },
      {
        id: "u4",
        number: 4,
        title: "Egenvärden",
        points: 8,
        intro: "Låt $A=\\begin{pmatrix}2&1\\\\1&2\\end{pmatrix}$.",
        subs: [
          {
            id: "u4a",
            label: "a",
            points: 2,
            text: "Bestäm egenvärdena.",
            topics: ["karpol", "egenmed"],
            hints: ["Lös $\\det(A-\\lambda I)=(2-\\lambda)^2-1=0$."],
            answer: "$\\lambda=1$ och $\\lambda=3$.",
          },
          {
            id: "u4b",
            label: "b",
            points: 3,
            text: "Bestäm en egenvektor till varje egenvärde.",
            topics: ["egenmed", "gauss"],
            hints: ["Lös $(A-\\lambda I)\\mathbf{x}=\\mathbf{0}$ för varje $\\lambda$."],
            answer: "$\\lambda=1$: $(1,-1)$. $\\lambda=3$: $(1,1)$.",
          },
          {
            id: "u4c",
            label: "c",
            points: 3,
            text: "Visa att $A$ är ortogonalt diagonaliserbar och ange $P$ och $D$.",
            topics: ["symm", "diag"],
            hints: [
              "En symmetrisk matris är ortogonalt diagonaliserbar.",
              "Normera egenvektorerna från b så att $P$ blir ortogonal.",
            ],
            answer: "$P=\\tfrac{1}{\\sqrt2}\\begin{pmatrix}1&1\\\\-1&1\\end{pmatrix}$, $D=\\operatorname{diag}(1,3)$.",
          },
        ],
      },
    ],
  },
];


/* -------------------------------------------------------------------------
 * FILLER EXAMS, for testing the exams index only. Deliberately fake: the
 * text, hints and answers are placeholders, and every title says "Mock".
 * Deterministic (no randomness) so the list is stable across reloads.
 * ----------------------------------------------------------------------- */

const FILLER_DATES = [
  "2026-08-21", "2026-04-04", "2026-01-14",
  "2025-08-22", "2025-03-29",
  "2024-10-19", "2024-08-23", "2024-04-06", "2024-01-10",
  "2023-08-18", "2023-04-01", "2023-01-11",
  "2022-10-15", "2022-08-19", "2022-03-26", "2022-01-12",
  "2021-08-20", "2021-04-03", "2021-01-13",
  "2020-08-21", "2020-06-05", "2020-01-15",
  "2019-08-23", "2019-04-05", "2019-01-09",
  "2018-08-24", "2018-03-24", "2018-01-10",
  "2017-08-25",
];

// Topics the mock exams rotate through (all exist in the SF1624 course).
const ROTATION = [
  "gauss", "det", "plan", "kerim", "egenmed", "mk", "invers", "avstand", "span", "diag",
  "projvek", "linavb", "gramschmidt", "rang", "skarning", "symm", "bas", "koord", "ortkomp", "karpol",
];

const PROPOSALS: Record<number, Omit<TopicProposal, "subs">> = {
  2: { id: "cramers-regel", name: "Cramers regel", parent: "det", module: 0, reason: "(Mock) Uppgiften löser ett system med determinanter, men inget ämne i grafen täcker metoden." },
  11: { id: "singularvarden", name: "Singulärvärden", parent: "symm", module: 5, reason: "(Mock) Uppgiften bygger på en uppdelning som saknar motsvarande ämne." },
};

function fillerExam(date: string, index: number): Exam {
  const id = `mock-${date}`;
  const month = Number(date.slice(5, 7));
  const sitting = month <= 2 ? "januari" : month <= 6 ? "våren" : month >= 10 ? "oktober" : "augusti";
  // Vary the shape so the index and the drill-down see different sizes: 3 to 6 exercises, 1 to 3 parts each.
  const exerciseCount = 3 + (index % 4);

  return {
    id,
    course: "SF1624",
    title: `Mocktenta ${sitting} ${date.slice(0, 4)}`,
    date,
    // Two exams carry an AI topic suggestion, so the "new topic suggested" line on the index is testable.
    proposals: PROPOSALS[index] ? [{ ...PROPOSALS[index], subs: [`${id}-u1a`] }] : [],
    exercises: Array.from({ length: exerciseCount }, (_, e) => {
      const partCount = 1 + ((index + e) % 3);
      return {
        id: `${id}-u${e + 1}`,
        number: e + 1,
        title: `Mockuppgift ${e + 1}`,
        points: partCount * 2,
        subs: Array.from({ length: partCount }, (_, p) => {
          const topic = ROTATION[(index * 3 + e * 2 + p) % ROTATION.length];
          const label = "abc"[p];
          return {
            id: `${id}-u${e + 1}${label}`,
            label,
            points: 2,
            text: `(Mock) Fråga om ${TOPIC_NAMES[topic] ?? topic}.`,
            topics: [topic],
            hints: ["(Mock) Ledtråd."],
            answer: "(Mock) Svar.",
          };
        }),
      };
    }),
  };
}

const fillerExams = FILLER_DATES.map(fillerExam);

/** The one authored example plus 29 filler exams: 30 in total, newest first. */
export const exams: Exam[] = [...authoredExams, ...fillerExams].sort((a, b) => (a.date < b.date ? 1 : -1));
