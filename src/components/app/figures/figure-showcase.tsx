"use client";

import { LessonView } from "./lesson-view";
import { MatrixFigure } from "./dynamic-figure";
import { WorkedExample } from "./worked-example";

/** Static examples for the design page, so figures can be checked without any AI. */
export function FigureShowcase() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <p className="type-eyebrow mb-1 text-subtle-foreground">Eigenvectors, draggable</p>
          <MatrixFigure matrix={{ a: 3, b: 1, c: 1, d: 3 }} vectors={[{ x: 1, y: 1, label: "v" }]} draggable showEigenvectors caption="Drag v until Av lines up with it." />
        </div>
        <div>
          <p className="type-eyebrow mb-1 text-subtle-foreground">Unit square, area scales by |det|</p>
          <MatrixFigure matrix={{ a: 2, b: 1, c: 0, d: 1.5 }} vectors={[{ x: 1, y: 1 }]} showUnitSquare showEigenvectors />
        </div>
        <div>
          <p className="type-eyebrow mb-1 text-subtle-foreground">No real eigenvectors (rotation 90°)</p>
          <MatrixFigure matrix={{ a: 0, b: -1, c: 1, d: 0 }} vectors={[{ x: 2, y: 1, label: "v" }]} showEigenvectors />
        </div>
        <div>
          <p className="type-eyebrow mb-1 text-subtle-foreground">Shear: only one eigen-direction</p>
          <MatrixFigure matrix={{ a: 1, b: 1, c: 0, d: 1 }} vectors={[{ x: 1, y: 2, label: "v" }]} showEigenvectors />
        </div>
      </div>

      <WorkedExample
        title="Egenvärden för A = [[3,1],[1,3]]"
        steps={[
          { text: "Egenvärden löser $\\det(A-\\lambda I)=0$.", tex: "\\det\\begin{pmatrix}3-\\lambda&1\\\\1&3-\\lambda\\end{pmatrix}=0" },
          { text: "Skriv ut determinanten.", tex: "(3-\\lambda)^2-1=0" },
          { text: "Då är $3-\\lambda=\\pm 1$, alltså $\\lambda=2$ eller $\\lambda=4$." },
        ]}
      />

      <LessonView
        title="Lektion (exempel)"
        blocks={[
          { type: "heading", text: "Idén" },
          { type: "text", text: "En **egenvektor** behåller sin riktning: $A\\mathbf{v}=\\lambda\\mathbf{v}$." },
          { type: "callout", tone: "remember", text: "Hitta först egenvärdena, sedan egenvektorerna." },
          { type: "callout", tone: "warning", text: "Nollvektorn är aldrig en egenvektor." },
        ]}
      />
    </div>
  );
}
