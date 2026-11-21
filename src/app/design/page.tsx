import type { Metadata } from "next";

import { FigureShowcase } from "@/components/app/figures/figure-showcase";
import { MasteryBadge, masteryBarClass, type MasteryState } from "@/components/mastery-badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Design system" };

/* Static class names so Tailwind's scanner picks every swatch up. */
const ladder = [
  { name: "background", note: "canvas, page", cls: "bg-background" },
  { name: "canvas-alt", note: "alt sections, panels", cls: "bg-canvas-alt" },
  { name: "card", note: "cards, reading areas", cls: "bg-card" },
  { name: "muted", note: "hover, wells, tracks", cls: "bg-muted" },
  { name: "surface-brand", note: "selected rows, tints", cls: "bg-surface-brand" },
  { name: "field-brand", note: "brand / CTA bands", cls: "bg-field-brand" },
  { name: "field-dark", note: "proof / editorial bands", cls: "bg-field-dark" },
];

const textRoles = [
  { name: "foreground", cls: "text-foreground", note: "all headings and body" },
  { name: "muted-foreground", cls: "text-muted-foreground", note: "ledes, descriptions" },
  { name: "subtle-foreground", cls: "text-subtle-foreground", note: "metadata, captions" },
  { name: "brand-accent", cls: "text-brand-accent", note: "eyebrows, short highlights" },
  { name: "disabled-foreground", cls: "text-disabled-foreground", note: "disabled only" },
];

const levels = [
  { name: "easy", cls: "bg-level-easy" },
  { name: "medium", cls: "bg-level-medium" },
  { name: "hard", cls: "bg-level-hard" },
  { name: "nightmare", cls: "bg-level-nightmare" },
  { name: "unrated", cls: "bg-level-unrated" },
];

const charts = ["bg-chart-1", "bg-chart-2", "bg-chart-3", "bg-chart-4", "bg-chart-5"];

const topics: { title: string; blurb: string; state: MasteryState; mastery: number; due?: string }[] = [
  { title: "Fourier series", blurb: "Any repeating signal is a sum of harmonics.", state: "mastered", mastery: 88 },
  { title: "Convolution theorem", blurb: "Sliding sums in time are products in frequency.", state: "practicing", mastery: 61, due: "Due today" },
  { title: "Windowing & spectral leakage", blurb: "Why peaks smear across bins.", state: "learning", mastery: 24, due: "Overdue 2d" },
  { title: "Spectrograms (STFT)", blurb: "Many short FFTs in a row.", state: "not-started", mastery: 0 },
];

function Section({ id, eyebrow, title, children }: { id: string; eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20 space-y-6">
      <div className="space-y-2">
        <Typography role="eyebrow">{eyebrow}</Typography>
        <Typography role="display-lg" as="h2">{title}</Typography>
      </div>
      {children}
    </section>
  );
}

export default function DesignPage() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-border-subtle bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-4 px-4">
          <span className="font-aviano text-lg tracking-wide">KOLLIN</span>
          <Badge variant="secondary">Design system</Badge>
          <nav className="ml-auto hidden items-center gap-4 text-sm text-muted-foreground sm:flex">
            <a className="hover:text-foreground" href="#color">Color</a>
            <a className="hover:text-foreground" href="#type">Type</a>
            <a className="hover:text-foreground" href="#components">Components</a>
            <a className="hover:text-foreground" href="#figures">Figures</a>
            <a className="hover:text-foreground" href="#product">Product</a>
          </nav>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-16 px-4 py-10 pb-24">
        <div className="space-y-3">
          <Typography role="eyebrow">Foundations</Typography>
          <Typography role="display-xl" as="h1">Warm, capable, focused.</Typography>
          <Typography role="body-lg" tone="muted" className="max-w-2xl">
            Burgundy is the ink, bordeaux the small accent, warm neutrals the ladder. Light and dark are generated from one token file and contrast-checked in both modes.
          </Typography>
        </div>

        <Section id="color" eyebrow="Color" title="Surfaces and ink">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {ladder.map((s) => (
              <div key={s.name} className="overflow-hidden rounded-xl border border-border">
                <div className={cn("h-20", s.cls)} />
                <div className="bg-card p-3">
                  <Typography role="body-sm" className="font-medium">{s.name}</Typography>
                  <Typography role="caption" tone="subtle">{s.note}</Typography>
                </div>
              </div>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Text roles</CardTitle>
              <CardDescription>Burgundy is the ink. Black and cool gray are never UI text.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {textRoles.map((t) => (
                <div key={t.name} className="flex items-baseline justify-between gap-3 border-b border-border-subtle pb-2">
                  <span className={cn("type-body font-medium", t.cls)}>{t.name}</span>
                  <Typography role="caption" tone="subtle">{t.note}</Typography>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Data hues (reserved)</CardTitle>
                <CardDescription>Difficulty and learner progress only. Never chrome, never brand.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                {levels.map((l) => (
                  <div key={l.name} className="flex items-center gap-2">
                    <span className={cn("size-5 rounded-full", l.cls)} />
                    <Typography role="body-sm">{l.name}</Typography>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Chart series</CardTitle>
                <CardDescription>Brand-warm sequence for general charts.</CardDescription>
              </CardHeader>
              <CardContent className="flex gap-2">
                {charts.map((c) => (
                  <span key={c} className={cn("h-10 flex-1 rounded-md", c)} />
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="rounded-xl bg-field-brand p-6 text-on-brand">
            <Typography role="eyebrow" tone="on-brand" className="opacity-80">Field brand</Typography>
            <Typography role="display-lg" as="h3" tone="on-brand" className="mt-1">Burgundy carries brand and CTA moments.</Typography>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button variant="inverse" size="lg">Start studying</Button>
              <Badge className="border-transparent bg-guld text-guld-foreground ring-1 ring-guld-foreground/40">Guld</Badge>
            </div>
          </div>
        </Section>

        <Section id="type" eyebrow="Typography" title="Roles, not utilities">
          <Card>
            <CardContent className="space-y-6 pt-2">
              <div className="grid gap-1 sm:grid-cols-[10rem_1fr] sm:items-baseline"><Typography role="caption" tone="subtle">display-xl</Typography><Typography role="display-xl" as="p">Plugga smart, tenta klart</Typography></div>
              <Separator />
              <div className="grid gap-1 sm:grid-cols-[10rem_1fr] sm:items-baseline"><Typography role="caption" tone="subtle">display-lg</Typography><Typography role="display-lg" as="p">Fourier transform</Typography></div>
              <Separator />
              <div className="grid gap-1 sm:grid-cols-[10rem_1fr] sm:items-baseline"><Typography role="caption" tone="subtle">section-title</Typography><Typography role="section-title" as="p">Your learning path</Typography></div>
              <div className="grid gap-1 sm:grid-cols-[10rem_1fr] sm:items-baseline"><Typography role="caption" tone="subtle">card-title</Typography><Typography role="card-title" as="p">Convolution theorem</Typography></div>
              <div className="grid gap-1 sm:grid-cols-[10rem_1fr] sm:items-baseline"><Typography role="caption" tone="subtle">body-lg / body</Typography><Typography role="body-lg">Convolution in time is multiplication in frequency, so filtering becomes a product.</Typography></div>
              <div className="grid gap-1 sm:grid-cols-[10rem_1fr] sm:items-baseline"><Typography role="caption" tone="subtle">body-sm</Typography><Typography role="body-sm" tone="muted">Review in 3 days. 12 minutes of practice left.</Typography></div>
              <div className="grid gap-1 sm:grid-cols-[10rem_1fr] sm:items-baseline"><Typography role="caption" tone="subtle">caption / eyebrow</Typography><div className="space-y-1"><Typography role="eyebrow">TSRT22 · Reglerteknik</Typography><Typography role="caption" tone="subtle">Updated 2 days ago</Typography></div></div>
              <Separator />
              <div className="grid gap-1 sm:grid-cols-[10rem_1fr] sm:items-baseline"><Typography role="caption" tone="subtle">stat</Typography><div className="flex gap-10"><div><Typography role="stat" as="p">88%</Typography><Typography role="caption" tone="subtle">mastery</Typography></div><div><Typography role="stat" as="p">12</Typography><Typography role="caption" tone="subtle">day streak</Typography></div></div></div>
              <div className="grid gap-1 sm:grid-cols-[10rem_1fr]"><Typography role="caption" tone="subtle">reading</Typography><Typography role="reading">A signal that repeats every <em>T</em> seconds can be built from sines at the fundamental <em>f₀ = 1/T</em> and its whole-number multiples. Reading text uses a slightly larger size, relaxed leading and a 68-character measure.</Typography></div>
            </CardContent>
          </Card>
        </Section>

        <Section id="components" eyebrow="Components" title="Primitives, themed">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>Buttons</CardTitle><CardDescription>One primary action per decision area.</CardDescription></CardHeader>
              <CardContent className="flex flex-wrap items-center gap-3">
                <Button>Primary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Delete</Button>
                <Button variant="link">Link</Button>
                <Button disabled>Disabled</Button>
                <Button size="touch">Touch target</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Form</CardTitle><CardDescription>Focus ring is burgundy (light) or soft rose (dark).</CardDescription></CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5"><Label htmlFor="email">Email</Label><Input id="email" type="email" placeholder="you@student.kth.se" /></div>
                <div className="space-y-1.5"><Label htmlFor="bad">Invalid</Label><Input id="bad" aria-invalid defaultValue="not-an-email" /></div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Badges</CardTitle><CardDescription>Chips are full pills.</CardDescription></CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Badge>Default</Badge><Badge variant="secondary">Secondary</Badge><Badge variant="outline">Outline</Badge>
                <MasteryBadge state="not-started" /><MasteryBadge state="learning" /><MasteryBadge state="practicing" /><MasteryBadge state="mastered" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Tabs</CardTitle><CardDescription>Segmented controls for filters.</CardDescription></CardHeader>
              <CardContent>
                <Tabs defaultValue="theory">
                  <TabsList><TabsTrigger value="theory">Theory</TabsTrigger><TabsTrigger value="practice">Practice</TabsTrigger></TabsList>
                  <TabsContent value="theory"><Typography role="body-sm" tone="muted" className="pt-3">Read the idea, then test it.</Typography></TabsContent>
                  <TabsContent value="practice"><Typography role="body-sm" tone="muted" className="pt-3">Exam-style exercises with worked solutions.</Typography></TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </Section>

        <Section id="figures" eyebrow="Tutor visuals" title="Figures and lessons">
          <FigureShowcase />
        </Section>

        <Section id="product" eyebrow="In context" title="Topic cards">
          <div className="grid gap-3 sm:grid-cols-2">
            {topics.map((t) => (
              <Card key={t.title} className="gap-3">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle>{t.title}</CardTitle>
                    <MasteryBadge state={t.state} />
                  </div>
                  <CardDescription>{t.blurb}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={t.mastery} aria-valuemin={0} aria-valuemax={100} aria-label={`${t.title} mastery`}>
                    <div className={cn("h-full rounded-full", masteryBarClass(t.mastery, t.state !== "not-started"))} style={{ width: `${t.mastery}%` }} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Typography role="caption" tone="subtle">{t.due ?? `${t.mastery}% mastery`}</Typography>
                    <div className="flex gap-2"><Button size="sm" variant="outline">Theory</Button><Button size="sm">Practice</Button></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </Section>
      </main>
    </div>
  );
}
