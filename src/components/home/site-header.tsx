import Link from "next/link";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

const links = [
  { href: "#how", label: "How it works" },
  { href: "#courses", label: "Courses" },
  { href: "#demo", label: "Try it" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border-subtle bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4 md:px-6">
        <Link href="/" className="font-aviano text-xl tracking-wide">KOLLIN</Link>
        <nav className="hidden items-center gap-1 md:flex" aria-label="Sections">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Button asChild size="lg"><a href="#demo">Try the demo</a></Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
