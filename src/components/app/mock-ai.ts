import { getContent, TOPIC_NAMES } from "@/mock";


/**
 * Canned tutor replies for the prototype. Real replies will come from the AI
 * SDK, grounded in the topic's exam exercises. Keep the shape: plain text with
 * `$math$`, `**bold**` and blank-line paragraphs.
 */
const explainers: Record<string, string> = {
  gauss:
    "Tänk på radoperationer som att du **skriver om samma system på ett enklare sätt**. Du ändrar aldrig vad som är sant, bara hur det ser ut.\n\nStarta med att göra första kolumnen ren: använd rad 1 för att nollställa allt under det ledande elementet. Gå sedan till nästa rad och nästa kolumn. När du når trappstegsform läser du av lösningen nerifrån och upp.\n\nOm en variabel saknar ledande element är den **fri**: du får välja den, och de andra variablerna uttrycks med den som parameter.",
  det:
    "Determinanten är faktorn som matrisen **skalar area eller volym med**. Ett $\\det=0$ betyder att allt plattas till något av lägre dimension, och då går det inte att vända tillbaka. Därför är $\\det A\\neq 0$ samma sak som att $A$ är inverterbar.\n\nVid räkning: radaddition är gratis (ändrar inget), radbyte ger minustecken, och att skala en rad med $c$ skalar determinanten med $c$.",
  kerim:
    "Kärnan är **allt som försvinner**: vektorer som avbildas på nollvektorn. Bilden är **allt som kan träffas**.\n\nDimensionssatsen säger att det som försvinner plus det som träffas tillsammans är hela startrummet: $\\dim V=\\dim\\ker T+\\dim\\operatorname{Im}T$. Ju mer som försvinner, desto mindre kan träffas.",
  egenmed:
    "En egenvektor är en riktning som matrisen **inte vrider**, bara sträcker eller krymper med faktorn $\\lambda$.\n\nRecept: lös $\\det(A-\\lambda I)=0$ för att hitta alla möjliga $\\lambda$, och lös sedan $(A-\\lambda I)\\mathbf{x}=\\mathbf{0}$ för varje $\\lambda$ för att hitta riktningarna.",
  diag:
    "Diagonalisering byter till en bas där matrisen bara **skalar längs axlarna**. I den basen är $D$ enkel att potensera, och $P$ och $P^{-1}$ översätter fram och tillbaka.\n\nDärför blir $A^{100}=PD^{100}P^{-1}$ ett jobb för tio sekunder i stället för hundra matrismultiplikationer.",
};

/** Only the topic matters here; a structural type keeps this file independent of the chat UI. */
export function mockReply(prompt: string, scope: { topicId?: string } | null): string {
  const id = scope?.topicId;
  const name = id ? TOPIC_NAMES[id] : undefined;
  const p = prompt.toLowerCase();

  if (id && explainers[id] && /(förklar|explain|förstå|enklare|varför|hjälp|why)/.test(p)) {
    return `${explainers[id]}\n\nVill du att jag ger dig ett nytt övningsexempel på **${name}**?`;
  }
  if (id && /(exempel|example|övning|ge mig)/.test(p)) {
    return `Här är ett exempel på **${name}**.\n\nJag tar en uppgift från tidigare tentor i kursen, byter siffrorna och går igenom lösningen i tre steg, där varje steg bygger på det förra. Försök själv först, så visar jag lösningen när du är klar.`;
  }
  if (id && getContent(id)) {
    const c = getContent(id)!;
    return `Kort om **${name}**: ${c.blurb}\n\nDet viktigaste att komma ihåg:\n\n${c.takeaways.map((t) => `• ${t}`).join("\n")}\n\nFråga mig gärna om en specifik uppgift du fastnat på.`;
  }
  if (name) {
    return `Jag har inte skrivit klart teorin för **${name}** än. Jag kan generera den från de tentauppgifter som hör till ämnet. Tryck på "Generera" på ämnessidan, så skriver jag den.`;
  }
  return "Jag kan förklara ett ämne, ge dig ett nytt övningsexempel eller hjälpa dig planera inför tentan. Öppna ett ämne så svarar jag med utgångspunkt i det, eller fråga rakt av.";
}
