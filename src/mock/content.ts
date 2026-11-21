import type { TopicContent } from "./types";

/**
 * AI-written topic content (mock). Authored for this prototype, not copied
 * from any exam. Inline math uses $...$ (KaTeX), emphasis uses **...**.
 */
export const content: Record<string, TopicContent> = {
  gauss: {
    minutes: 12,
    blurb: "Förenkla ett ekvationssystem med radoperationer tills lösningen går att läsa av.",
    theory: [
      { t: "h", text: "Idén" },
      {
        t: "p",
        text: "Ett linjärt ekvationssystem $A\\mathbf{x}=\\mathbf{b}$ skrivs som en utökad matris $[A\\mid\\mathbf{b}]$. Med tre sorters **radoperationer** ändras systemet utan att lösningsmängden ändras: byt plats på två rader, multiplicera en rad med $c\\neq 0$, addera en multipel av en rad till en annan.",
      },
      { t: "h", text: "Trappstegsform" },
      {
        t: "p",
        text: "Målet är trappstegsform: det första nollskilda talet i varje rad (**ledande element**) ligger längre åt höger än i raden ovanför, och nollrader ligger sist. Kolonner med ledande element ger **basvariabler**, övriga kolonner ger **fria variabler**.",
      },
      { t: "h", text: "Hur många lösningar?" },
      {
        t: "list",
        items: [
          "En rad av typen $[0\\ 0\\ \\cdots\\ 0\\mid c]$ med $c\\neq 0$: **ingen lösning**.",
          "Annars, och inga fria variabler: **exakt en lösning**.",
          "Annars, och minst en fri variabel: **oändligt många lösningar**, en parameter per fri variabel.",
        ],
      },
    ],
    formulas: [
      "[A \\mid \\mathbf{b}] \\sim \\cdots \\sim [R \\mid \\mathbf{c}]",
      "\\#\\text{fria variabler} = n - \\operatorname{rang}(A)",
    ],
    takeaways: [
      "Radoperationer ändrar aldrig lösningsmängden.",
      "Trappstegsform gör lösningen avläsbar, med bakåtsubstitution.",
      "En motsägelserad $[0\\cdots 0\\mid c\\neq 0]$ betyder att systemet saknar lösning.",
      "Antalet fria variabler är $n-\\operatorname{rang}A$.",
    ],
    questions: [
      {
        q: "Efter radreducering har den utökade matrisen en rad $[0\\ 0\\ 0\\mid 5]$. Vad kan du säga om systemet?",
        options: ["Det saknar lösning", "Det har exakt en lösning", "Det har oändligt många lösningar", "Det går inte att avgöra"],
        answer: 0,
        explain: "Raden betyder $0=5$, vilket aldrig stämmer. Då saknar systemet lösning.",
      },
      {
        q: "Ett lösbart system har 4 variabler och rang 3. Hur många fria variabler har det?",
        options: ["1", "3", "0", "4"],
        answer: 0,
        explain: "Antalet fria variabler är $n-\\operatorname{rang}A=4-3=1$.",
      },
      {
        q: "Vilken operation ändrar inte lösningsmängden?",
        options: [
          "Addera 2 gånger rad 1 till rad 2",
          "Multiplicera en rad med 0",
          "Stryka en kolonn i $A$",
          "Byta tecken på högerledet $\\mathbf{b}$ men inte på $A$",
        ],
        answer: 0,
        explain: "Att addera en radmultipel till en annan rad är en tillåten radoperation. Att multiplicera med 0 förstör information.",
      },
      {
        q: "Systemet $x+y=2,\\ 2x+2y=4$ har",
        options: ["oändligt många lösningar", "ingen lösning", "exakt en lösning", "exakt två lösningar"],
        answer: 0,
        explain: "Andra ekvationen är två gånger den första. En ekvation för två variabler ger en fri variabel och en hel linje av lösningar.",
      },
    ],
  },

  det: {
    minutes: 10,
    blurb: "Ett enda tal som avslöjar om en matris är inverterbar och hur den skalar area och volym.",
    theory: [
      { t: "h", text: "Vad är determinanten?" },
      {
        t: "p",
        text: "För en kvadratisk matris $A$ är $\\det A$ ett tal. För $2\\times 2$ gäller $\\det\\begin{pmatrix}a&b\\\\c&d\\end{pmatrix}=ad-bc$. Absolutbeloppet $|\\det A|$ är faktorn med vilken $A$ skalar area (i planet) eller volym (i rummet).",
      },
      { t: "h", text: "Räkna med radoperationer" },
      {
        t: "list",
        items: [
          "Byte av två rader ändrar tecknet på $\\det A$.",
          "Multiplikation av en rad med $c$ multiplicerar $\\det A$ med $c$.",
          "Addition av en radmultipel till en annan rad ändrar **inte** $\\det A$.",
          "För en trappstegsmatris är $\\det A$ produkten av diagonalelementen.",
        ],
      },
      { t: "h", text: "Viktiga räkneregler" },
      {
        t: "p",
        text: "$\\det(AB)=\\det A\\cdot\\det B$, $\\det A^T=\\det A$ och $\\det(cA)=c^n\\det A$ för en $n\\times n$-matris. Matrisen $A$ är inverterbar om och endast om $\\det A\\neq 0$.",
      },
    ],
    formulas: [
      "\\det\\begin{pmatrix}a&b\\\\c&d\\end{pmatrix}=ad-bc",
      "\\det(AB)=\\det A\\,\\det B",
      "A\\text{ inverterbar}\\iff\\det A\\neq 0",
    ],
    takeaways: [
      "$2\\times 2$: $ad-bc$.",
      "Radaddition ändrar inte determinanten, radbyte ändrar tecknet.",
      "$\\det(cA)=c^n\\det A$, inte $c\\det A$.",
      "$\\det A\\neq 0$ betyder att $A$ är inverterbar.",
    ],
    questions: [
      {
        q: "Beräkna $\\det\\begin{pmatrix}2&3\\\\1&4\\end{pmatrix}$.",
        options: ["5", "11", "-5", "6"],
        answer: 0,
        explain: "$2\\cdot4-3\\cdot1=8-3=5$.",
      },
      {
        q: "$A$ är en $3\\times3$-matris med $\\det A=2$. Vad är $\\det(3A)$?",
        options: ["54", "6", "18", "8"],
        answer: 0,
        explain: "$\\det(3A)=3^3\\det A=27\\cdot2=54$. Varje rad multipliceras med 3, och det finns tre rader.",
      },
      {
        q: "Om två rader i $A$ är lika, så är $\\det A$",
        options: ["0", "1", "odefinierad", "-1"],
        answer: 0,
        explain: "Subtrahera den ena raden från den andra: du får en nollrad utan att $\\det$ ändras, och en nollrad ger $\\det=0$.",
      },
      {
        q: "Du adderar 5 gånger rad 1 till rad 2. Hur ändras $\\det A$?",
        options: ["Den ändras inte", "Den multipliceras med 5", "Den byter tecken", "Den blir 0"],
        answer: 0,
        explain: "Att addera en radmultipel till en annan rad påverkar inte determinanten.",
      },
    ],
  },

  kerim: {
    minutes: 14,
    blurb: "Vilka vektorer försvinner, och vilka vektorer kan avbildningen träffa?",
    theory: [
      { t: "h", text: "Definitioner" },
      {
        t: "p",
        text: "För en linjär avbildning $T:V\\to W$ är **kärnan** $\\ker T=\\{\\mathbf{v}\\in V: T(\\mathbf{v})=\\mathbf{0}\\}$ och **bilden** $\\operatorname{Im}T=\\{T(\\mathbf{v}):\\mathbf{v}\\in V\\}$. Båda är delrum: kärnan i $V$ och bilden i $W$.",
      },
      { t: "h", text: "Med matriser" },
      {
        t: "p",
        text: "Om $T(\\mathbf{x})=A\\mathbf{x}$ är $\\ker T=\\operatorname{Null}A$ (lös $A\\mathbf{x}=\\mathbf{0}$) och $\\operatorname{Im}T=\\operatorname{Col}A$, kolonnernas linjära hölje.",
      },
      { t: "h", text: "Dimensionssatsen" },
      {
        t: "p",
        text: "$\\dim V=\\dim\\ker T+\\dim\\operatorname{Im}T$. För en matris med $n$ kolonner: $n=\\dim\\operatorname{Null}A+\\operatorname{rang}A$.",
      },
      {
        t: "list",
        items: [
          "$T$ är **injektiv** om och endast om $\\ker T=\\{\\mathbf{0}\\}$.",
          "$T$ är **surjektiv** om och endast om $\\operatorname{Im}T=W$.",
        ],
      },
    ],
    formulas: [
      "\\ker T=\\{\\mathbf{v}: T(\\mathbf{v})=\\mathbf{0}\\}",
      "\\dim V=\\dim\\ker T+\\dim\\operatorname{Im}T",
    ],
    takeaways: [
      "Kärnan är det som avbildas på noll, bilden är det som träffas.",
      "Kärna = Null, bild = Col när avbildningen ges av en matris.",
      "Dimensionssatsen: $\\dim V=\\dim\\ker+\\dim\\operatorname{Im}$.",
      "Injektiv betyder att kärnan bara innehåller $\\mathbf{0}$.",
    ],
    questions: [
      {
        q: "$T:\\mathbb{R}^5\\to\\mathbb{R}^3$ är linjär och $\\dim\\ker T=2$. Vad är $\\dim\\operatorname{Im}T$?",
        options: ["3", "2", "5", "7"],
        answer: 0,
        explain: "Dimensionssatsen ger $\\dim\\operatorname{Im}T=5-2=3$.",
      },
      {
        q: "$T$ är injektiv om och endast om",
        options: ["$\\ker T=\\{\\mathbf{0}\\}$", "$\\operatorname{Im}T=W$", "$\\dim\\ker T=\\dim V$", "$T(\\mathbf{v})=\\mathbf{v}$ för alla $\\mathbf{v}$"],
        answer: 0,
        explain: "Om två vektorer ger samma bild ligger deras differens i kärnan. Är kärnan bara $\\mathbf{0}$ kan det inte hända.",
      },
      {
        q: "$A$ är $4\\times 6$ med rang 3. Vad är $\\dim\\operatorname{Null}A$?",
        options: ["3", "1", "4", "2"],
        answer: 0,
        explain: "$A$ har 6 kolonner, så $\\dim\\operatorname{Null}A=6-3=3$.",
      },
      {
        q: "Vilken vektor ligger i $\\ker T$ för $T(x,y)=(x+y,\\ 2x+2y)$?",
        options: ["$(1,-1)$", "$(1,1)$", "$(2,-1)$", "$(1,0)$"],
        answer: 0,
        explain: "$T(1,-1)=(0,0)$. De andra ger nollskilda bilder, till exempel $T(1,1)=(2,4)$.",
      },
    ],
  },

  egenmed: {
    minutes: 15,
    blurb: "Hitta de riktningar som en matris bara sträcker eller vänder.",
    theory: [
      { t: "h", text: "Definition" },
      {
        t: "p",
        text: "En vektor $\\mathbf{v}\\neq\\mathbf{0}$ är en **egenvektor** till $A$ med **egenvärde** $\\lambda$ om $A\\mathbf{v}=\\lambda\\mathbf{v}$. Alla egenvektorer till samma $\\lambda$, tillsammans med nollvektorn, bildar **egenrummet** $E_\\lambda=\\operatorname{Null}(A-\\lambda I)$.",
      },
      { t: "h", text: "Så gör du" },
      {
        t: "list",
        items: [
          "Lös $\\det(A-\\lambda I)=0$ för att få egenvärdena.",
          "För varje $\\lambda$: lös $(A-\\lambda I)\\mathbf{x}=\\mathbf{0}$ med Gausseliminering.",
          "Ange en bas för egenrummet.",
        ],
      },
      { t: "h", text: "Exempel" },
      {
        t: "p",
        text: "För $A=\\begin{pmatrix}2&1\\\\0&3\\end{pmatrix}$ är $\\det(A-\\lambda I)=(2-\\lambda)(3-\\lambda)$, så $\\lambda=2$ eller $\\lambda=3$. För triangulära matriser står egenvärdena på diagonalen.",
      },
    ],
    formulas: ["A\\mathbf{v}=\\lambda\\mathbf{v}", "\\det(A-\\lambda I)=0", "E_\\lambda=\\operatorname{Null}(A-\\lambda I)"],
    takeaways: [
      "Egenvektorn byter inte riktning, bara längd (och eventuellt tecken).",
      "Egenvärden är rötterna till det karakteristiska polynomet.",
      "Nollvektorn är aldrig en egenvektor, men ligger i egenrummet.",
      "Egenvärdet 0 betyder att matrisen inte är inverterbar.",
    ],
    questions: [
      {
        q: "Vilka är egenvärdena till $\\begin{pmatrix}4&0\\\\0&-1\\end{pmatrix}$?",
        options: ["4 och -1", "4 och 0", "-1 och 0", "3"],
        answer: 0,
        explain: "Matrisen är diagonal, så egenvärdena står på diagonalen.",
      },
      {
        q: "$\\det(A-\\lambda I)=\\lambda^2-5\\lambda+6$. Vilka är egenvärdena?",
        options: ["2 och 3", "-2 och -3", "1 och 6", "5 och 6"],
        answer: 0,
        explain: "$\\lambda^2-5\\lambda+6=(\\lambda-2)(\\lambda-3)$.",
      },
      {
        q: "Är $\\mathbf{0}$ en egenvektor?",
        options: ["Nej, per definition", "Ja, till alla $\\lambda$", "Ja, men bara för $\\lambda=0$", "Det beror på $A$"],
        answer: 0,
        explain: "Definitionen kräver $\\mathbf{v}\\neq\\mathbf{0}$. Annars skulle $A\\mathbf{0}=\\lambda\\mathbf{0}$ gälla för alla $\\lambda$ och begreppet bli meningslöst.",
      },
      {
        q: "$A$ har egenvärdet 0. Då gäller",
        options: ["$A$ är inte inverterbar", "$A=0$", "$A$ är symmetrisk", "$A$ saknar egenvektorer"],
        answer: 0,
        explain: "Egenvärdet 0 ger en nollskild vektor med $A\\mathbf{v}=\\mathbf{0}$, så $\\det A=0$.",
      },
    ],
  },

  diag: {
    minutes: 13,
    blurb: "Skriv $A=PDP^{-1}$ så blir potenser och system enkla att räkna.",
    theory: [
      { t: "h", text: "Diagonalisering" },
      {
        t: "p",
        text: "En $n\\times n$-matris $A$ är **diagonaliserbar** om det finns en inverterbar $P$ och en diagonalmatris $D$ med $A=PDP^{-1}$. Kolonnerna i $P$ är egenvektorer, och diagonalen i $D$ innehåller motsvarande egenvärden. Det går om och endast om $A$ har $n$ linjärt oberoende egenvektorer.",
      },
      { t: "h", text: "Potenser" },
      {
        t: "p",
        text: "$A^k=PD^kP^{-1}$, och $D^k$ fås genom att potensera varje diagonalelement. Det gör till exempel $A^{100}$ lätt att räkna ut.",
      },
      { t: "h", text: "Fallgrop" },
      {
        t: "p",
        text: "$n$ olika egenvärden räcker alltid. Upprepade egenvärden kan fungera, men bara om egenrummen är stora nog: den geometriska multipliciteten måste vara lika med den algebraiska.",
      },
    ],
    formulas: ["A=PDP^{-1}", "A^k=PD^kP^{-1}"],
    takeaways: [
      "$P$ har egenvektorer som kolonner, $D$ har egenvärden på diagonalen.",
      "$A^k=PD^kP^{-1}$.",
      "$n$ olika egenvärden ger alltid diagonaliserbarhet.",
      "Upprepade egenvärden kan göra matrisen icke-diagonaliserbar.",
    ],
    questions: [
      {
        q: "$A=PDP^{-1}$ med $D=\\operatorname{diag}(2,3)$. Vad är $A^{10}$?",
        options: [
          "$P\\operatorname{diag}(2^{10},3^{10})P^{-1}$",
          "$P\\operatorname{diag}(20,30)P^{-1}$",
          "$\\operatorname{diag}(2^{10},3^{10})$",
          "$10A$",
        ],
        answer: 0,
        explain: "$A^k=PD^kP^{-1}$, och $D^{10}$ fås genom att potensera varje diagonalelement.",
      },
      {
        q: "En $3\\times3$-matris med tre olika egenvärden är",
        options: ["alltid diagonaliserbar", "aldrig diagonaliserbar", "bara diagonaliserbar om den är symmetrisk", "bara diagonaliserbar om $\\det A\\neq0$"],
        answer: 0,
        explain: "Egenvektorer till olika egenvärden är linjärt oberoende, så tre egenvärden ger tre oberoende egenvektorer.",
      },
      {
        q: "Kolonnerna i $P$ är",
        options: ["egenvektorer till $A$", "raderna i $A$", "egenvärdena", "alltid en ON-bas"],
        answer: 0,
        explain: "$AP=PD$ betyder att varje kolonn $\\mathbf{p}_i$ uppfyller $A\\mathbf{p}_i=\\lambda_i\\mathbf{p}_i$.",
      },
      {
        q: "Matrisen $\\begin{pmatrix}1&1\\\\0&1\\end{pmatrix}$ är",
        options: ["inte diagonaliserbar", "diagonaliserbar", "symmetrisk", "har två olika egenvärden"],
        answer: 0,
        explain: "Egenvärdet 1 är dubbelt men egenrummet är bara endimensionellt, så det finns inte två oberoende egenvektorer.",
      },
    ],
  },
};
