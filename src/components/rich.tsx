import katex from "katex";
import "katex/dist/katex.min.css";
import { Fragment } from "react";

import { cn } from "@/lib/utils";

function renderTex(tex: string, display: boolean) {
  return katex.renderToString(tex, { displayMode: display, throwOnError: false, strict: "ignore" });
}

/** Display-mode formula on its own line. */
export function Formula({ tex, className }: { tex: string; className?: string }) {
  return <div className={cn("overflow-x-auto py-1", className)} dangerouslySetInnerHTML={{ __html: renderTex(tex, true) }} />;
}

/**
 * Inline rich text: `$math$` rendered with KaTeX, `**bold**`, `*italic*`.
 * Safe by construction: only these tokens are interpreted, everything else
 * is rendered as plain React text.
 */
export function Rich({ text, className }: { text: string; className?: string }) {
  const parts = text.split(/(\$[^$]+\$|\*\*[^*]+\*\*|\*[^*]+\*)/g).filter(Boolean);
  return (
    <span className={className}>
      {parts.map((p, i) => {
        if (p.startsWith("$") && p.endsWith("$") && p.length > 2) {
          return <span key={i} dangerouslySetInnerHTML={{ __html: renderTex(p.slice(1, -1), false) }} />;
        }
        if (p.startsWith("**") && p.endsWith("**")) return <strong key={i} className="font-semibold">{p.slice(2, -2)}</strong>;
        if (p.startsWith("*") && p.endsWith("*") && p.length > 2) return <em key={i}>{p.slice(1, -1)}</em>;
        return <Fragment key={i}>{p}</Fragment>;
      })}
    </span>
  );
}
