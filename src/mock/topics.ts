import type { Topic } from "./types";

/**
 * Shared topic catalog (Swedish, as in Kollin's real course taxonomy).
 * Names come from Kollin's production tags for SF1624 (KTH) and TATA24 (LiU).
 * Only five topics have AI-written content; the rest show the
 * "generate with AI" flow.
 */
const names: Record<string, string> = {
  // Linjära ekvationssystem & matriser
  losbarhet: "Satsen om lösbarhet",
  gauss: "Gausseliminering & lösning av ekvationssystem",
  det: "Determinant",
  losningsmangd: "Lösningsmängd",
  invers: "Matrisinvers & inverterbarhet",
  rang: "Rang",
  spar: "Spår",
  matrisekv: "Matrisekvation",
  matrisop: "Matrisoperationer",
  // Analytisk geometri
  plan: "Planets ekvation",
  vektorkalkyl: "Vektorkalkyl",
  skarning: "Skärning",
  avstand: "Avståndsproblem",
  linje: "Räta linjens ekvation",
  projvek: "Projektion på vektor & rät linje",
  projplan: "Projektion på plan",
  spegling: "Reflektion (spegling)",
  // Vektorrum & baser
  span: "Linjärkombination & linjärt hölje (span)",
  bas: "Basbegreppet",
  koord: "Koordinater",
  basbyte: "Basbyte",
  dim: "Dimension",
  abstrakt: "Abstrakt vektorrum",
  // Linjära avbildningar
  linavb: "Linjär avbildning & linjäritet",
  kerim: "Kärna & bild (Ker & Im)",
  avbmatris: "Avbildningsmatris & geometri",
  avbbas: "Avbildningsmatris i olika baser",
  nullcol: "Nollrum, kolonnrum & radrum",
  // Egenvärden
  egenmed: "Egenvärde, egenvektor & egenrum (med given matris)",
  egenutan: "Egenvärde, egenvektor & egenrum (utan given matris)",
  diagbar: "Diagonaliserbarhet",
  diag: "Diagonalisering & matrispotens",
  karpol: "Karakteristiskt polynom",
  diffsys: "System av differentialekvationer",
  diffekv: "System av differensekvationer",
  // ON-baser, MK & kvadratiska former
  symm: "Symmetrisk matris & ortogonal diagonalisering",
  mk: "Minsta-kvadrat-metoden",
  projdelrum: "Projektion på delrum",
  gramschmidt: "ON-bas & Gram-Schmidts process",
  ortkomp: "Ortogonalt komplement",
  kvadform: "Kvadratisk form",
  kvadkurvor: "Kvadratiska kurvor & ytor",
  // Komplexa tal & induktion
  komplexrak: "Komplexa tal & de fyra räknesätten",
  komplexpolar: "Komplexa tal på polär form",
  demoivre: "de Moivres formel",
  induktion: "Induktionsbevis",
};

export const TOPIC_NAMES = names;

export function topicName(id: string, extra?: Record<string, string>): string {
  return extra?.[id] ?? names[id] ?? id;
}

export const topics: Topic[] = Object.entries(names).map(([id, name]) => ({ id, name }));
