import {
	boolean,
	integer,
	pgTable,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";

export const productPrices = pgTable("product_prices", {
	id: uuid().primaryKey().notNull(),
	productType: varchar("product_type", { length: 255 }).notNull(),
	productId: integer("product_id").notNull(),
	priceCents: integer("price_cents").notNull(),
	currency: varchar({ length: 255 }).default("sek").notNull(),
	accessDays: integer("access_days").default(360),
	discountPercentage: integer("discount_percentage").default(0),
	active: boolean().default(true).notNull(),
	createdAt: timestamp("created_at", {
		withTimezone: true,
		mode: "string",
	}).notNull(),
	updatedAt: timestamp("updated_at", {
		withTimezone: true,
		mode: "string",
	}).notNull(),
});

export type ProductPrice = typeof productPrices.$inferSelect;
export type NewProductPrice = typeof productPrices.$inferInsert;
