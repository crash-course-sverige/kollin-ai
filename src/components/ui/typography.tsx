import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentPropsWithoutRef, ElementType } from "react";

import { cn } from "@/lib/utils";

/**
 * Typography: size + family come from `role`, color from `tone`. Do not
 * re-express size, color or font family in `className`.
 *
 * Roles mirror Kollin's typography standard (display roles use Proxima Nova
 * Wide, the rest Inter). `as` changes the HTML element without changing the
 * look, so heading semantics stay correct for SEO and screen readers.
 */
const typography = cva("", {
  variants: {
    role: {
      "display-hero": "type-display-hero",
      "display-xl": "type-display-xl",
      "display-lg": "type-display-lg",
      "section-title": "type-section-title",
      "card-title": "type-card-title",
      "body-lg": "type-body-lg",
      body: "type-body",
      "body-sm": "type-body-sm",
      caption: "type-caption",
      eyebrow: "type-eyebrow",
      stat: "type-stat",
      reading: "type-reading",
    },
    tone: {
      default: "text-foreground",
      muted: "text-muted-foreground",
      subtle: "text-subtle-foreground",
      disabled: "text-disabled-foreground",
      accent: "text-brand-accent",
      "on-brand": "text-on-brand",
      destructive: "text-destructive",
    },
  },
  defaultVariants: { role: "body", tone: "default" },
});

type Role = NonNullable<VariantProps<typeof typography>["role"]>;

const defaultElement: Record<Role, ElementType> = {
  "display-hero": "h1",
  "display-xl": "h1",
  "display-lg": "h2",
  "section-title": "h2",
  "card-title": "h3",
  "body-lg": "p",
  body: "p",
  "body-sm": "p",
  caption: "p",
  eyebrow: "p",
  stat: "p",
  reading: "div",
};

type TypographyProps<T extends ElementType> = VariantProps<typeof typography> & {
  as?: T;
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "className">;

export function Typography<T extends ElementType = "p">({
  role = "body",
  tone,
  as,
  className,
  ...props
}: TypographyProps<T>) {
  const Component: ElementType = as ?? defaultElement[role as Role];
  // Eyebrows are accent-toned by default (Kollin: bordeaux for eyebrows).
  const resolvedTone = tone ?? (role === "eyebrow" ? "accent" : "default");
  return <Component className={cn(typography({ role, tone: resolvedTone }), className)} {...props} />;
}

export { typography };
