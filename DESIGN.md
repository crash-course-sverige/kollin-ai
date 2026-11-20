# Kollin design system

Brand source: next-kollin (`themes/colors.ts`, `docs/standards/frontend/visual-design.md`). This repo re-expresses it as OKLCH tokens with a generated light + dark theme. Live reference: `/design`.

## Brand in one paragraph

Capable enough for serious technical work, warm enough for demanding study. **Burgundy is the ink** (text, primary button, brand fields). **Bordeaux is the accent**: eyebrows, active-tab underline, link hover, one line of text, never a paragraph, never on a burgundy field. Surfaces are a **warm ladder**, not cool grays. No blue-purple SaaS look, no glass or glow, no decorative dots.

## Where things live

| What | Where |
| --- | --- |
| Color source of truth (hex, aliases, contrast pairs) | `tokens/kollin.tokens.json` |
| Generator + contrast check | `scripts/build-tokens.mjs` (`pnpm tokens`, `pnpm tokens:check`) |
| Generated CSS (do not edit) | `src/styles/tokens.css` |
| Tailwind mapping, typography roles, base styles | `src/app/globals.css` |
| Primitives (shadcn, Radix) | `src/components/ui/*` |
| Typography component | `src/components/ui/typography.tsx` |

`pnpm dev` and `pnpm build` regenerate tokens first. The build fails if an enforced contrast pair drops below its minimum in either mode.

## Rules

1. **Use roles, never raw values.** `bg-background`, `bg-card`, `text-muted-foreground`, `border-border`. No hex, no `gray-*`/`slate-*`/`neutral-*`.
2. **Surface ladder:** `background` (page) → `canvas-alt` (alt sections, panels) → `card` (reading areas) → `muted` (hover, wells, tracks) → `surface-brand` (selected tint) → `field-brand` (CTA band) / `field-dark` (editorial proof band). Depth comes from these steps, not shadows.
3. **Text:** `foreground` > `muted-foreground` > `subtle-foreground` (metadata) > `disabled-foreground` (disabled only). `brand-accent` for eyebrows. `text-on-brand` on burgundy.
4. **One primary action per decision area.** `Button` default = burgundy. `inverse` only on a burgundy field. Never a second filled red.
5. **Data hues are reserved.** `level-*` (green/yellow/red/purple/gray) mean difficulty or learner mastery and nothing else. Use `MasteryBadge` and `masteryBarClass`.
6. **Gold is Guld only:** burgundy chip with gold text (`bg-guld text-guld-foreground`).
7. **Typography via `<Typography role tone as>`.** Roles use a `type-*` prefix so tailwind-merge never confuses them with text colors. Do not set size, color or family in `className`. Display roles = Proxima Nova Wide, everything else Inter. Aviano Sans (`font-aviano`) for the wordmark only.
8. **Density:** product and admin surfaces are compact and scannable; marketing may use airy type. Working surfaces get no gradients or display type.
9. **Phone-first:** primary actions use `size="touch"` (`h-touch`, 2.75rem).
10. **Dark mode is built in.** Add a role to *both* `semantic.light` and `semantic.dark` (the build fails on drift), then map it in `globals.css` under `@theme inline`.

## Adding or changing a color

1. Edit `tokens/kollin.tokens.json` (primitive, then semantic light + dark).
2. Add a contrast pair if text sits on it.
3. `pnpm tokens` → fix any failures → map new roles in `globals.css`.

## Known gaps

- Input border (`warm-gray-700`) is about 1.8:1 on white, below WCAG 1.4.11's 3:1 for control boundaries. This is Kollin's current brand value; reported as a warning, not enforced.
- Dark mode is derived here. next-kollin has no governed dark theme, so treat these values as a proposal.
- Proxima Nova Wide comes from Kollin's Adobe Fonts kit, which serves allow-listed domains only. New preview and production domains must be added in Adobe Fonts or the display face falls back to Inter.
