import {
	bigserial,
	integer,
	pgTable,
	text,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";

export const awsdmsDdlAudit = pgTable("awsdms_ddl_audit", {
	cKey: bigserial("c_key", { mode: "bigint" }).notNull(),
	cTime: timestamp("c_time", { mode: "string" }),
	cUser: varchar("c_user", { length: 64 }),
	cTxn: varchar("c_txn", { length: 16 }),
	cTag: varchar("c_tag", { length: 24 }),
	cOid: integer("c_oid"),
	cName: varchar("c_name", { length: 64 }),
	cSchema: varchar("c_schema", { length: 64 }),
	cDdlqry: text("c_ddlqry"),
});

export type AwsdmsDdlAudit = typeof awsdmsDdlAudit.$inferSelect;
export type NewAwsdmsDdlAudit = typeof awsdmsDdlAudit.$inferInsert;
