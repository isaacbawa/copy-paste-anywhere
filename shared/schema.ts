import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const clips = pgTable("clips", {
  id: text("id").primaryKey(), // Random string ID
  content: text("content").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  isRevoked: text("is_revoked").default("false"), // Using text for boolean compatibility
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertClipSchema = createInsertSchema(clips).pick({
  content: true,
  expiresAt: true,
});

export type InsertClip = z.infer<typeof insertClipSchema>;
export type Clip = typeof clips.$inferSelect;
