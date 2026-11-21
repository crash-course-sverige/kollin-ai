import type { InferUITools, UIMessage } from "ai";

import type { Tier } from "./models";
import type { TutorTools } from "./tools";

/** Metadata attached to each assistant message (shown in a small footer). */
export type TutorMetadata = {
  tier?: Tier;
  model?: string;
  /** true when no Gateway credentials were available and the scripted demo answered */
  demo?: boolean;
  usage?: { inputTokens?: number; outputTokens?: number };
  /** Gateway generation id: look up exact cost and provider with gateway.getGenerationInfo */
  generationId?: string;
};

/** Custom streamed data parts. */
export type TutorData = {
  suggestions: { items: string[] };
};

export type TutorUIMessage = UIMessage<TutorMetadata, TutorData, InferUITools<TutorTools>>;

/** What the browser sends alongside the messages. */
export type ChatRequestBody = {
  id?: string;
  messages: TutorUIMessage[];
  scope?: { label: string; topicId?: string; course?: string };
  learner?: import("./tools").LearnerState;
  userId?: string;
};
