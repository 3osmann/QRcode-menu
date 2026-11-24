import { integer, jsonb, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

// One row per bowl order sent to the kitchen.
// Prices are stored in integer cents, recalculated on the server.
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  noodle: text("noodle").notNull(),
  broth: text("broth").notNull(),
  toppings: jsonb("toppings").$type<string[]>().notNull(),
  quantity: integer("quantity").notNull(),
  subtotalCents: integer("subtotal_cents").notNull(),
  taxCents: integer("tax_cents").notNull(),
  totalCents: integer("total_cents").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
