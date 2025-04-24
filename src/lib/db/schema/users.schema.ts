import { relations } from "drizzle-orm";
import {
	boolean,
	foreignKey,
	inet,
	integer,
	json,
	jsonb,
	pgTable,
	serial,
	timestamp,
	unique,
	uniqueIndex,
	varchar,
} from "drizzle-orm/pg-core";

import { answers } from "./answers.schema";
import { bookmarks } from "./bookmarks.schema";
import { categorisations } from "./categorisations.schema";
import { chapters } from "./chapters.schema";
import { clusterGroups } from "./cluster-groups.schema";
import { comments } from "./comments.schema";
import { couponUsage } from "./coupon-usage.schema";
import { coupons } from "./coupons.schema";
import { courseReviews } from "./course-reviews.schema";
import { creditTransactions } from "./credit-transactions.schema";
import { exerciseEvaluations } from "./exercise-evaluations.schema";
import { exerciseNotes } from "./exercise-notes.schema";
import { exercises } from "./exercises.schema";
import { flashcardEvaluations } from "./flashcard-evaluations.schema";
import { flashcards } from "./flashcards.schema";
import { groupJoinRequests } from "./group-join-requests.schema";
import { groupMemberInvites } from "./group-member-invites.schema";
import { groupMembers } from "./group-members.schema";
import { groups } from "./groups.schema";
import { interactions } from "./interactions.schema";
import { liveSessionAttendees } from "./live-session-attendees.schema";
import { liveSessions } from "./live-sessions.schema";
import { memberships } from "./memberships.schema";
import { messages } from "./messages.schema";
import { notifications } from "./notifications.schema";
import { orders } from "./orders.schema";
import { otps } from "./otps.schema";
import { pendingTransactions } from "./pending-transactions.schema";
import { programs } from "./programs.schema";
import { questions } from "./questions.schema";
import { reactions } from "./reactions.schema";
import { referrals } from "./referrals.schema";
import { resources } from "./resources.schema";
import { schools } from "./schools.schema";
import { segments } from "./segments.schema";
import { solutions } from "./solutions.schema";
import { sources } from "./sources.schema";
import { stripeSessions } from "./stripe-sessions.schema";
import { studyPlans } from "./study-plans.schema";
import { subscriptionTrialCoupons } from "./subscription-trial-coupons.schema";
import { swishPayments } from "./swish-payments.schema";
import { tagVotes } from "./tag-votes.schema";
import { tags } from "./tags.schema";
import { textData } from "./text-data.schema";
import { theoryBookings } from "./theory-bookings.schema";
import { threadFollowers } from "./thread-followers.schema";
import { threads } from "./threads.schema";
import { userAchievements } from "./user-achievements.schema";
import { userCourses } from "./user-courses.schema";
import { userDevices } from "./user-devices.schema";
import { userEvaluations } from "./user-evaluations.schema";

export const users = pgTable(
	"users",
	{
		id: serial().primaryKey().notNull(),
		firstName: varchar("first_name", { length: 255 }),
		lastName: varchar("last_name", { length: 255 }),
		email: varchar({ length: 255 }),
		password: varchar({ length: 255 }),
		currentIp: inet("current_ip"),
		lastSignIn: timestamp("last_sign_in", {
			withTimezone: true,
			mode: "string",
		}),
		resetPasswordToken: varchar("reset_password_token", { length: 255 }),
		resetPasswordExpires: timestamp("reset_password_expires", {
			withTimezone: true,
			mode: "string",
		}),
		enrollmentYear: integer("enrollment_year"),
		schoolId: integer("school_id"),
		programId: integer("program_id"),
		admin: boolean().default(false),
		assistant: boolean().default(false),
		blacklisted: boolean().default(false),
		createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
			.defaultNow()
			.notNull(),
		avatar: varchar({ length: 2048 }),
		stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
		credits: integer().default(0).notNull(),
		premium: boolean().default(false),
		chatQuota: jsonb("chat_quota")
			.$type<{
				remaining: number;
				lastReset: string;
			}>()
			.default({
				remaining: 5, // There is a trigger in the database that sets this to 20 when the user activates subscription (migration 0033)
				lastReset: "1999-01-01T00:00:00.000Z",
			}),
		emailVerified: boolean("email_verified").default(false).notNull(),
		verifyEmailToken: varchar("verify_email_token", { length: 255 }),
		verifyEmailExpires: timestamp("verify_email_expires", {
			withTimezone: true,
			mode: "string",
		}),
		studentEmail: varchar("student_email", { length: 255 }),
		settings: json(),
		phoneNumber: varchar("phone_number", { length: 255 }),
		deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "string" }),
		maxAllowedDevices: integer("max_allowed_devices").default(1),
	},
	(table) => {
		return [
			uniqueIndex("users_phone_number_key").using(
				"btree",
				table.phoneNumber.asc().nullsLast(),
			),
			foreignKey({
				columns: [table.programId],
				foreignColumns: [programs.id],
				name: "users_program_id_fkey",
			}),
			foreignKey({
				columns: [table.schoolId],
				foreignColumns: [schools.id],
				name: "users_school_id_fkey",
			}),
			unique("users_email_key").on(table.email),
		];
	},
);

export const usersRelations = relations(users, ({ one, many }) => ({
	userDevices: many(userDevices),
	groupMemberInvites_userId: many(groupMemberInvites, {
		relationName: "groupMemberInvites_userId_users_id",
	}),
	groupMemberInvites_invitedBy: many(groupMemberInvites, {
		relationName: "groupMemberInvites_invitedBy_users_id",
	}),
	courseReviews: many(courseReviews),
	couponUsages: many(couponUsage),
	flashcardEvaluations: many(flashcardEvaluations),
	exerciseEvaluations: many(exerciseEvaluations),
	memberships: many(memberships),
	referrals_receiverId: many(referrals, {
		relationName: "referrals_receiverId_users_id",
	}),
	referrals_senderId: many(referrals, {
		relationName: "referrals_senderId_users_id",
	}),
	subscriptionTrialCoupons: many(subscriptionTrialCoupons),
	userCourses: many(userCourses),
	solutions: many(solutions),
	threadFollowers: many(threadFollowers),
	textData: many(textData),
	swishPayments: many(swishPayments),
	tags: many(tags),
	stripeSessions: many(stripeSessions),
	sources: many(sources),
	theoryBookings: many(theoryBookings),
	userEvaluations: many(userEvaluations),
	answers: many(answers),
	notifications_recipientId: many(notifications, {
		relationName: "notifications_recipientId_users_id",
	}),
	notifications_senderId: many(notifications, {
		relationName: "notifications_senderId_users_id",
	}),
	coupons: many(coupons),
	liveSessions: many(liveSessions),
	threads: many(threads),
	comments: many(comments),
	flashcards: many(flashcards),
	creditTransactions: many(creditTransactions),
	orders: many(orders),
	program: one(programs, {
		fields: [users.programId],
		references: [programs.id],
	}),
	school: one(schools, {
		fields: [users.schoolId],
		references: [schools.id],
	}),
	groupMembers: many(groupMembers),
	groupJoinRequests: many(groupJoinRequests),
	liveSessionAttendees: many(liveSessionAttendees),
	interactions: many(interactions),
	exercises: many(exercises),
	resources: many(resources),
	segments: many(segments),
	pendingTransactions: many(pendingTransactions),
	questions: many(questions),
	studyPlans: many(studyPlans),
	userAchievements: many(userAchievements),
	exerciseNotes: many(exerciseNotes),
	messages: many(messages),
	otps: many(otps),
	tagVotes: many(tagVotes),
	reactions: many(reactions),
	bookmarks: many(bookmarks),
	categorisations: many(categorisations),
	clusterGroups: many(clusterGroups),
	groups: many(groups),
	chapters: many(chapters),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
