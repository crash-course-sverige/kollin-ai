import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const registrationTranscriptVerifications = pgTable(
	"registration_transcript_verifications",
	{
		personalNumberHash: text("personal_number_hash").notNull(),
		userId: integer("user_id").notNull(),
		groupId: uuid("group_id").notNull(),
		programCode: text("program_code").notNull(),
		timestamp: timestamp("timestamp", {
			withTimezone: true,
			mode: "string",
		}).notNull(),
	},
);
