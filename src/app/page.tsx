import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { CoursesSection } from "@/components/home/courses-section";
import { DemoPicker } from "@/components/home/demo-picker";
import { HeroVisual } from "@/components/home/hero-visual";
import { Principle } from "@/components/home/principle";
import { Reveal } from "@/components/home/reveal";
import { SiteHeader } from "@/components/home/site-header";
import { TopicTicker } from "@/components/home/topic-ticker";
import { courses, TOPIC_NAMES } from "@/mock";

export const metadata: Metadata = {
  title: { absolute: "Kollin: study what the exam actually asks" },
  description:
    "Kollin turns past exams into a map of every topic you need. Log your study steps, build your notebook and learn from the students who sat the exam before you.",
};

const examsRead = courses.reduce((a, c) => a + c.exams, 0);

function Section({ id, eyebrow, title, intro, children, alt }: { id: string; eyebrow: string; title: string; intro: string; children: ReactNode; alt?: boolean }) {
  return (
    <section id={id} className={`scroll-mt-14 py-16 md:py-24 ${alt ? "bg-canvas-alt" : ""}`}>
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <Reveal className="mb-8 max-w-2xl space-y-3 md:mb-12">
          <Typography role="eyebrow">{eyebrow}</Typography>
          <Typography role="display-xl" as="h2">{title}</Typography>
          <Typography role="body-lg" tone="muted">{intro}</Typography>
        </Reveal>
        <Reveal delay={0.08}>{children}</Reveal>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-14 md:px-6 md:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16 lg:py-28">
          <div className="space-y-7">
            <Typography role="eyebrow">AI study platform for engineering students</Typography>
            <Typography role="display-hero" as="h1">Study what the exam actually asks.</Typography>
            <Typography role="body-lg" tone="muted" className="max-w-xl">
              Kollin reads years of past exams and turns them into a map of everything you need to know. Log every step, build one notebook, and learn from the students who sat the exam before you.
            </Typography>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-3">
                <Button asChild size="touch">
                  <a href="#demo">Try a demo course <ArrowRight /></a>
                </Button>
                <Button asChild size="touch" variant="outline">
                  <a href="#courses">Browse courses</a>
                </Button>
              </div>
              <Typography role="body-sm" tone="subtle">No sign-up. Pick your program and see your course in under a minute.</Typography>
            </div>
            <dl className="flex flex-wrap gap-x-10 gap-y-4 border-t border-border-subtle pt-6">
              {[
                [examsRead, "past exams read"],
                [courses.length, "universities so far"],
                [Object.keys(TOPIC_NAMES).length, "topics mapped"],
              ].map(([n, l]) => (
                <div key={l}>
                  <dd className="type-stat">{n}</dd>
                  <dt className="type-caption text-subtle-foreground">{l}</dt>
                </div>
              ))}
            </dl>
          </div>
          <HeroVisual />
        </section>

        <TopicTicker />

        <Section
          id="how"
          eyebrow="The principle"
          title="Exams are the syllabus that matters"
          intro="Your course says what could come up. Past exams show what does. Kollin builds everything else around that: your plan, your reviews, your notes."
        >
          <Principle />
        </Section>

        <Section
          id="courses"
          alt
          eyebrow="Courses"
          title="Built from real exams"
          intro="Each course is read exam by exam, split into modules and tagged topic by topic. Open one and look around."
        >
          <CoursesSection />
        </Section>

        <Section
          id="demo"
          eyebrow="Try Kollin"
          title="Choose your program. We show your course."
          intro="Two choices and you are in a real course with its topic map, exams and AI tutor. No account needed for the demo."
        >
          <DemoPicker />
        </Section>

        {/* Closing call to action */}
        <section className="px-4 pb-16 md:px-6 md:pb-24">
          <Reveal className="mx-auto max-w-6xl rounded-3xl bg-field-brand px-6 py-12 text-center text-on-brand md:px-12 md:py-16">
            <Typography role="display-xl" as="h2" tone="on-brand" className="mx-auto max-w-2xl">Stop guessing what to study.</Typography>
            <Typography role="body-lg" tone="on-brand" className="mx-auto mt-3 max-w-xl opacity-80">
              Your exam is coming either way. Find your course and let the past exams tell you where to begin.
            </Typography>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Button asChild variant="inverse" size="touch"><a href="#demo">Try a demo course <ArrowRight /></a></Button>
              <Button asChild variant="ghost" size="touch" className="text-on-brand hover:bg-white/10 hover:text-on-brand">
                <a href="#courses">Browse courses</a>
              </Button>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="border-t border-border-subtle">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-8 md:px-6">
          <span className="font-aviano text-lg tracking-wide">KOLLIN</span>
          <Typography role="caption" tone="subtle">Prototype. Course data is real, study progress is demo data.</Typography>
          <nav className="ml-auto flex gap-5" aria-label="Footer">
            <Link href="/app" className="type-body-sm text-muted-foreground hover:text-foreground">App</Link>
            <Link href="/design" className="type-body-sm text-muted-foreground hover:text-foreground">Design system</Link>
          </nav>
        </div>
      </footer>
    </>
  );
}
