"use client";

import { BookOpen, CalendarDays, GraduationCap, LayoutGrid, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { MasteryBadge } from "@/components/mastery-badge";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { masteryState, topicsOf, useStudy } from "@/lib/study";
import { courses } from "@/mock";

import { useAi } from "./ai-context";

export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const router = useRouter();
  const { ask } = useAi();
  const { state, course, nameOf, scores, actions } = useStudy();
  const [query, setQuery] = useState("");

  const go = (href: string) => {
    onOpenChange(false);
    setQuery("");
    router.push(href);
  };

  const topics = state ? topicsOf(course.code, state.accepted) : [];

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} title="Search" description="Jump to a topic, course or ask the AI.">
      {/* This shadcn version's CommandDialog does not provide the cmdk root. */}
      <Command>
      <CommandInput value={query} onValueChange={setQuery} placeholder="Search topics, courses… or ask a question" />
      <CommandList>
        <CommandEmpty>No match. Press Enter to ask the AI instead.</CommandEmpty>

        {query.trim().length > 2 && (
          <>
            <CommandGroup heading="Ask">
              <CommandItem
                value={`ask ${query}`}
                onSelect={() => {
                  onOpenChange(false);
                  ask(query);
                  setQuery("");
                }}
              >
                <Sparkles className="text-brand-accent" />
                <span className="truncate">Ask AI: “{query}”</span>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        <CommandGroup heading="Go to">
          <CommandItem value="today idag dashboard" onSelect={() => go("/app")}>
            <CalendarDays /> Today
          </CommandItem>
          <CommandItem value="course map karta" onSelect={() => go(`/app/course/${course.code}`)}>
            <LayoutGrid /> {course.code} topic map
          </CommandItem>
          <CommandItem value="exams tentor" onSelect={() => go(`/app/course/${course.code}/exams`)}>
            <GraduationCap /> {course.code} exams
          </CommandItem>
        </CommandGroup>

        <CommandGroup heading="Courses">
          {courses.map((c) => (
            <CommandItem
              key={c.code}
              value={`course ${c.code} ${c.name} ${c.schoolShort}`}
              onSelect={() => {
                actions.setCourse(c.code);
                go(`/app/course/${c.code}`);
              }}
            >
              <BookOpen />
              <span className="truncate">
                {c.code} · {c.name}
              </span>
              <span className="ml-auto text-xs text-muted-foreground">{c.schoolShort}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading={`Topics in ${course.code}`}>
          {topics.map((t) => (
            <CommandItem key={t.id} value={`topic ${nameOf(t.id)}`} onSelect={() => go(`/app/course/${course.code}/topic/${t.id}`)}>
              <span className="truncate">{nameOf(t.id)}</span>
              <MasteryBadge state={masteryState(scores[t.id])} className="ml-auto" />
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
      </Command>
    </CommandDialog>
  );
}
