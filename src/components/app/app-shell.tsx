"use client";

import { CalendarDays, ChevronsUpDown, GraduationCap, LayoutGrid, RotateCcw, Search, Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Kbd } from "@/components/ui/kbd";
import { Toaster } from "@/components/ui/sonner";
import { useStudy } from "@/lib/study";
import { courses } from "@/mock";
import { cn } from "@/lib/utils";

import { AiPanel } from "./ai-panel";
import { AiProvider, useAi } from "./ai-context";
import { CommandPalette } from "./command-palette";

function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { course, actions, ready } = useStudy();
  const { open: aiOpen, setOpen: setAiOpen } = useAi();
  const [paletteOpen, setPaletteOpen] = useState(false);

  // Global shortcuts: Cmd/Ctrl+K search, Cmd/Ctrl+J AI tutor.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return;
      if (e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      } else if (e.key.toLowerCase() === "j") {
        e.preventDefault();
        setAiOpen(!aiOpen);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [aiOpen, setAiOpen]);

  const nav = [
    { href: "/app", label: "Today", icon: CalendarDays, active: pathname === "/app" },
    {
      href: `/app/course/${course.code}`,
      label: "Topic map",
      icon: LayoutGrid,
      active: pathname.startsWith(`/app/course/`) && !pathname.includes("/exam"),
    },
    {
      href: `/app/course/${course.code}/exams`,
      label: "Exams",
      icon: GraduationCap,
      active: pathname.includes("/exam"),
    },
  ];

  const switcher = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex w-full items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-left transition-colors hover:bg-muted"
          aria-label="Switch course"
        >
          <div className="min-w-0 flex-1">
            <div className="type-eyebrow text-brand-accent">{course.schoolShort}</div>
            <div className="truncate text-sm font-medium">
              {course.code} · {course.name}
            </div>
          </div>
          <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Your courses</DropdownMenuLabel>
        {courses.map((c) => (
          <DropdownMenuItem
            key={c.code}
            onSelect={() => {
              actions.setCourse(c.code);
              router.push(`/app/course/${c.code}`);
            }}
          >
            <div className="min-w-0">
              <div className="truncate font-medium">
                {c.code} · {c.name}
              </div>
              <div className="text-xs text-muted-foreground">{c.school}</div>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="min-h-screen md:grid md:grid-cols-[16rem_1fr]">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen flex-col gap-4 border-r border-border-subtle bg-canvas-alt p-4 md:flex">
        <Link href="/app" className="font-aviano text-xl tracking-wide">KOLLIN</Link>
        {ready ? switcher : <div className="h-[52px] animate-pulse rounded-lg bg-muted" />}

        <nav className="flex flex-col gap-1" aria-label="Main">
          {nav.map((n) => (
            <Link
              key={n.label}
              href={n.href}
              aria-current={n.active ? "page" : undefined}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                n.active && "bg-card text-foreground shadow-xs ring-1 ring-border-subtle",
              )}
            >
              <n.icon className="size-4" />
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-col gap-2">
          <Button variant="outline" className="justify-start gap-2" onClick={() => setPaletteOpen(true)}>
            <Search /> Search <span className="ml-auto flex gap-0.5"><Kbd>⌘</Kbd><Kbd>K</Kbd></span>
          </Button>
          <Button variant="outline" className="justify-start gap-2" onClick={() => setAiOpen(true)}>
            <Sparkles className="text-brand-accent" /> Ask AI <span className="ml-auto flex gap-0.5"><Kbd>⌘</Kbd><Kbd>J</Kbd></span>
          </Button>
        </div>

        <div className="mt-auto flex items-center gap-2">
          <Badge variant="outline" className="text-muted-foreground">Mock data</Badge>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Reset demo data"
            onClick={() => {
              actions.reset();
              toast("Demo data reset");
            }}
          >
            <RotateCcw />
          </Button>
          <div className="ml-auto"><ThemeToggle /></div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-20 flex items-center gap-2 border-b border-border-subtle bg-background/90 px-3 py-2 backdrop-blur md:hidden">
        <Link href="/app" className="font-aviano text-lg tracking-wide">KOLLIN</Link>
        <div className="ml-auto flex items-center gap-1">
          <Button variant="ghost" size="icon" aria-label="Search" onClick={() => setPaletteOpen(true)}><Search /></Button>
          <Button variant="ghost" size="icon" aria-label="Ask AI" onClick={() => setAiOpen(true)}><Sparkles className="text-brand-accent" /></Button>
          <ThemeToggle />
        </div>
      </header>

      <main className="min-w-0 px-4 pt-6 pb-28 md:px-8 md:pb-16">
        <div className="mx-auto max-w-5xl">
          <div className="mb-4 md:hidden">{ready ? switcher : null}</div>
          {children}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-3 border-t border-border-subtle bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden" aria-label="Main">
        {nav.map((n) => (
          <Link
            key={n.label}
            href={n.href}
            aria-current={n.active ? "page" : undefined}
            className={cn("flex h-touch flex-col items-center justify-center gap-0.5 text-xs font-medium text-muted-foreground", n.active && "text-foreground")}
          >
            <n.icon className="size-5" />
            {n.label}
          </Link>
        ))}
      </nav>

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
      <AiPanel />
      <Toaster position="bottom-right" />
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <AiProvider>
      <Shell>{children}</Shell>
    </AiProvider>
  );
}
