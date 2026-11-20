import Link from "next/link";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-6 px-4 py-16">
      <div className="flex items-center justify-between">
        <span className="font-aviano text-xl tracking-wide">KOLLIN</span>
        <ThemeToggle />
      </div>
      <Typography role="eyebrow">Under construction</Typography>
      <Typography role="display-xl" as="h1">An AI-native study platform, built from your exams.</Typography>
      <Typography role="body-lg" tone="muted">
        Exams become exercises, exercises become topics, and topics grow into a graph of what to study next.
      </Typography>
      <div>
        <Button asChild size="lg">
          <Link href="/design">See the design system</Link>
        </Button>
      </div>
    </main>
  );
}
