import { pgTable, text, integer, doublePrecision, timestamp, jsonb, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

function generateOrderReference(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),
  reference: text("reference").$defaultFn(() => generateOrderReference()),
  userId: integer("user_id"),
  status: text("status").notNull().default("pending"),
  total: doublePrecision("total").notNull(),
  deliveryAddress: text("delivery_address").notNull(),
  deliveryLat: doublePrecision("delivery_lat"),
  deliveryLng: doublePrecision("delivery_lng"),
  estimatedMinutes: integer("estimated_minutes"),
  items: jsonb("items").notNull().$defaultFn(() => []),
  adminNote: text("admin_note"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertOrderSchema = createInsertSchema(ordersTable).omit({ id: true, reference: true, createdAt: true });
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof ordersTable.$inferSelect;
