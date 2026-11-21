"use client";

import { Check, Copy, RotateCcw, Sparkles, ThumbsDown, ThumbsUp, Trash2 } from "lucide-react";
import { useState } from "react";

import { Conversation, ConversationContent, ConversationEmptyState, ConversationScrollButton } from "@/components/ai-elements/conversation";
import { Message, MessageAction, MessageActions, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { PromptInput, PromptInputBody, PromptInputFooter, PromptInputSubmit, PromptInputTextarea, PromptInputTools } from "@/components/ai-elements/prompt-input";
import { Reasoning, ReasoningContent, ReasoningTrigger } from "@/components/ai-elements/reasoning";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { TutorUIMessage } from "@/lib/ai/types";
import { cn } from "@/lib/utils";

import { useAi } from "./ai-context";
import { FigureCard, LessonCard, NoteConfirmation, OpenedTopic, QuizCard, SourceList, ThinkingDots, ToolStep } from "./chat-parts";

const starters = (hasTopic: boolean) =>
  hasTopic
    ? ["Förklara det här enklare", "Ge mig en övningsfråga", "Visa tentauppgifter om det här"]
    : ["Vad ska jag plugga idag?", "Hur ligger jag till inför tentan?"];

const shortModel = (m?: string) => (m ? m.split("/").at(-1) : undefined);

function Meta({ message }: { message: TutorUIMessage }) {
  const m = message.metadata;
  if (!m) return null;
  const tokens = (m.usage?.inputTokens ?? 0) + (m.usage?.outputTokens ?? 0);
  return (
    <p className="mt-1 text-[0.6875rem] text-subtle-foreground">
      {m.demo ? "Demo script, no model" : [shortModel(m.model), m.tier && `${m.tier} tier`, tokens ? `${tokens.toLocaleString()} tokens` : null].filter(Boolean).join(" · ")}
    </p>
  );
}

function AssistantMessage({ message, isLast, streaming, course }: { message: TutorUIMessage; isLast: boolean; streaming: boolean; course: string }) {
  const { regenerate } = useAi();
  const [vote, setVote] = useState<"up" | "down" | null>(null);
  const [copied, setCopied] = useState(false);

  const text = message.parts.flatMap((p) => (p.type === "text" ? [p.text] : [])).join("\n\n");
  const sources = message.parts.flatMap((p) => (p.type === "source-url" ? [{ id: p.sourceId, url: p.url, title: p.title ?? p.url }] : []));
  const hasContent = message.parts.some((p) => p.type !== "step-start");
  // Some providers send a long tool call (a whole lesson) in one go, so nothing arrives for a while.
  // Keep a "working" indicator up whenever we are streaming and the last thing shown is a finished tool step.
  const tail = message.parts.at(-1);
  const waiting =
    isLast &&
    streaming &&
    hasContent &&
    (tail?.type === "step-start" || (tail?.type.startsWith("tool-") && "state" in tail && tail.state === "output-available"));

  return (
    <Message from="assistant">
      <MessageContent className="w-full">
        {!hasContent && <ThinkingDots />}
        <SourceList sources={sources} />
        {message.parts.map((part, i) => {
          const last = isLast && streaming && i === message.parts.length - 1;
          switch (part.type) {
            case "reasoning":
              return (
                <Reasoning key={i} isStreaming={last}>
                  <ReasoningTrigger />
                  <ReasoningContent>{part.text}</ReasoningContent>
                </Reasoning>
              );
            case "text":
              return part.text ? <MessageResponse key={i} isAnimating={last}>{part.text}</MessageResponse> : null;
            case "tool-quiz":
              return <QuizCard key={part.toolCallId} part={part} course={course} stale={!isLast} />;
            case "tool-saveNote":
              return <NoteConfirmation key={part.toolCallId} part={part} stale={!isLast} />;
            case "tool-openTopic":
              return <OpenedTopic key={part.toolCallId} part={part} />;
            case "tool-showFigure":
              return <FigureCard key={part.toolCallId} part={part} />;
            case "tool-showLesson":
              return <LessonCard key={part.toolCallId} part={part} />;
            default:
              return part.type.startsWith("tool-") ? <ToolStep key={i} part={part} /> : null;
          }
        })}
        {waiting && <ThinkingDots />}
        {!streaming || !isLast ? <Meta message={message} /> : null}
      </MessageContent>

      {!(isLast && streaming) && text && (
        <MessageActions className="mt-1">
          <MessageAction
            tooltip="Copy"
            label="Copy"
            onClick={() => {
              void navigator.clipboard?.writeText(text);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
          >
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          </MessageAction>
          {isLast && (
            <MessageAction tooltip="Try again" label="Try again" onClick={regenerate}>
              <RotateCcw className="size-3.5" />
            </MessageAction>
          )}
          <MessageAction tooltip="Helpful" label="Helpful" onClick={() => setVote((v) => (v === "up" ? null : "up"))}>
            <ThumbsUp className={cn("size-3.5", vote === "up" && "fill-current")} />
          </MessageAction>
          <MessageAction tooltip="Not helpful" label="Not helpful" onClick={() => setVote((v) => (v === "down" ? null : "down"))}>
            <ThumbsDown className={cn("size-3.5", vote === "down" && "fill-current")} />
          </MessageAction>
        </MessageActions>
      )}
    </Message>
  );
}

export function AiPanel() {
  const { open, setOpen, scope, messages, status, error, busy, ask, stop, regenerate, clear } = useAi();
  const streaming = status === "streaming" || status === "submitted";
  const course = scope?.course ?? "SF1624";

  // Follow-up chips come from the last assistant message and only while idle.
  const lastMsg = messages.at(-1);
  const chips =
    !busy && lastMsg?.role === "assistant"
      ? lastMsg.parts.flatMap((p) => (p.type === "data-suggestions" ? p.data.items : []))
      : [];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {/* The sheet sets its width under a `data-[side=right]` variant, so overrides must use the same variant. */}
      <SheetContent side="right" className="gap-0 p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-lg">
        <SheetHeader className="border-b border-border-subtle p-4">
          <div className="flex items-center gap-2 pr-8">
            <Sparkles className="size-4 text-brand-accent" />
            <SheetTitle className="type-card-title">Kollin AI</SheetTitle>
            {messages.length > 0 && (
              <Button variant="ghost" size="sm" className="ml-auto" onClick={clear}>
                <Trash2 /> New chat
              </Button>
            )}
          </div>
          <SheetDescription className="sr-only">Ask the AI tutor about what you are studying.</SheetDescription>
          {scope ? (
            <Badge variant="secondary" className="w-fit max-w-full justify-start">
              <span className="truncate">Context: {scope.label}</span>
            </Badge>
          ) : (
            <span className="text-xs text-subtle-foreground">No topic open. Answers will be general.</span>
          )}
        </SheetHeader>

        <Conversation className="min-h-0 flex-1">
          <ConversationContent className="gap-5 p-4">
            {messages.length === 0 ? (
              <ConversationEmptyState
                title="Ask anything about your course"
                description="Answers use your exam material, and I can quiz you, find exam parts, or open a topic."
                icon={<Sparkles className="size-5 text-brand-accent" />}
              />
            ) : (
              messages.map((m, idx) =>
                m.role === "user" ? (
                  <Message key={m.id} from="user">
                    <MessageContent>{m.parts.map((p, i) => (p.type === "text" ? <span key={i}>{p.text}</span> : null))}</MessageContent>
                  </Message>
                ) : (
                  <AssistantMessage key={m.id} message={m} isLast={idx === messages.length - 1} streaming={streaming} course={course} />
                ),
              )
            )}
            {error && (
              <Alert variant="destructive" className="not-prose">
                <AlertDescription className="flex items-center justify-between gap-3">
                  <span>{error.message?.slice(0, 160) || "Something went wrong."}</span>
                  <Button size="sm" variant="outline" onClick={regenerate}>Retry</Button>
                </AlertDescription>
              </Alert>
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        <div className="space-y-2 border-t border-border-subtle p-3">
          {(messages.length === 0 || chips.length > 0) && (
            <Suggestions>
              {(messages.length === 0 ? starters(!!scope?.topicId) : chips).map((s) => (
                <Suggestion key={s} suggestion={s} onClick={(v) => ask(v)} />
              ))}
            </Suggestions>
          )}
          <PromptInput
            onSubmit={({ text }) => {
              if (text.trim()) ask(text);
            }}
          >
            <PromptInputBody>
              <PromptInputTextarea placeholder="Fråga något…" aria-label="Message" />
            </PromptInputBody>
            <PromptInputFooter>
              <PromptInputTools>
                <span className="px-1 text-[0.6875rem] text-subtle-foreground">
                  <Kbd>Enter</Kbd> send · <Kbd>Shift</Kbd>+<Kbd>Enter</Kbd> new line
                </span>
              </PromptInputTools>
              <PromptInputSubmit status={status} onStop={stop} />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </SheetContent>
    </Sheet>
  );
}
