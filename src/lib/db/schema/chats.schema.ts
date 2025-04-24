import {
	type AssistantContent,
	type Attachment,
	type ToolContent,
	type UserContent,
} from "ai";
import { InferInsertModel, InferSelectModel, relations } from "drizzle-orm";
import {
	boolean,
	foreignKey,
	integer,
	jsonb,
	pgTable,
	primaryKey,
	text,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";

import { MessageMetadata } from "@/utils/llm/llm-metadata";

import { courses } from "./courses.schema";
import { exercises } from "./exercises.schema";
import { users } from "./users.schema";

export const chats = pgTable("chats", {
	id: uuid("id").primaryKey().notNull().defaultRandom(),
	title: text("title"),
	userId: integer("user_id")
		.notNull()
		.references(() => users.id),
	courseId: integer("course_id").references(() => courses.id),
	exerciseId: integer("exercise_id").references(() => exercises.id),
	createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
		.defaultNow()
		.notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
		.defaultNow()
		.notNull(),
});

export const chatRelations = relations(chats, ({ one, many }) => ({
	user: one(users, {
		fields: [chats.userId],
		references: [users.id],
	}),
	course: one(courses, {
		fields: [chats.courseId],
		references: [courses.id],
	}),
	exercise: one(exercises, {
		fields: [chats.exerciseId],
		references: [exercises.id],
	}),
	messages: many(chatMessages),
}));

type MessageContent = ToolContent | AssistantContent | UserContent;

export const chatMessages = pgTable("chat_messages", {
	id: uuid("id").primaryKey().notNull().defaultRandom(),
	chatId: uuid("chat_id")
		.notNull()
		.references(() => chats.id),
	role: varchar("role").notNull(),
	content: jsonb("content").$type<MessageContent>().notNull(),
	attachments: jsonb("attachments").$type<Attachment[]>(),
	metadata: jsonb("metadata").$type<MessageMetadata>(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
		.defaultNow()
		.notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
		.defaultNow()
		.notNull(),
});

export const chatMessageRelations = relations(chatMessages, ({ one }) => ({
	chat: one(chats, {
		fields: [chatMessages.chatId],
		references: [chats.id],
	}),
}));

export const chatMessageVotes = pgTable(
	"chat_message_votes",
	{
		chatId: uuid("chat_id").notNull(),
		messageId: uuid("message_id").notNull(),
		isUpvoted: boolean("is_upvoted").notNull(),
		createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
			.defaultNow()
			.notNull(),
	},
	(table) => {
		return [
			primaryKey({ columns: [table.chatId, table.messageId] }),
			foreignKey({
				columns: [table.chatId],
				foreignColumns: [chats.id],
				name: "chat_message_vote_chat_id_fkey",
			}),
			foreignKey({
				columns: [table.messageId],
				foreignColumns: [chatMessages.id],
				name: "chat_message_vote_message_id_fkey",
			}),
		];
	},
);

export const chatPromptSuggestions = pgTable("chat_prompt_suggestions", {
	id: uuid("id").primaryKey().notNull().defaultRandom(),
	courseId: integer("course_id").references(() => courses.id),
	exerciseId: integer("exercise_id").references(() => exercises.id),
	title: text("title").notNull(),
	label: text("label").notNull(),
	action: text("action").notNull(),
	selectionCount: integer("selection_count").notNull().default(0),
	createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
		.defaultNow()
		.notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
		.defaultNow()
		.notNull(),
});

export const chatPromptSuggestionsRelations = relations(
	chatPromptSuggestions,
	({ one }) => ({
		course: one(courses, {
			fields: [chatPromptSuggestions.courseId],
			references: [courses.id],
		}),
		exercise: one(exercises, {
			fields: [chatPromptSuggestions.exerciseId],
			references: [exercises.id],
		}),
	}),
);

export type ChatMessage = InferSelectModel<typeof chatMessages>;
export type Chat = InferSelectModel<typeof chats>;
export type ChatMessageVote = InferSelectModel<typeof chatMessageVotes>;
export type ChatMessageCreateVote = InferInsertModel<typeof chatMessageVotes>;
export type ChatPromptSuggestion = InferSelectModel<
	typeof chatPromptSuggestions
>;
export type NewChatPromptSuggestion = InferInsertModel<
	typeof chatPromptSuggestions
>;
