import { pgTable, text, integer, timestamp, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const chefsTable = pgTable("chefs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  specialty: text("specialty").notNull(),
  bio: text("bio"),
  imageUrl: text("image_url"),
  yearsExperience: integer("years_experience").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertChefSchema = createInsertSchema(chefsTable).omit({ id: true, createdAt: true });
export type InsertChef = z.infer<typeof insertChefSchema>;
export type Chef = typeof chefsTable.$inferSelect;
