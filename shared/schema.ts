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

// Schema for API requests
export const createClipRequestSchema = z.object({
  content: z.string().min(1, "Content cannot be empty").max(1000000, "Content too large"),
  expiryDuration: z.enum(["2min", "5min", "10min", "1hour", "24hour"]).optional(),
  customExpiry: z.string().optional(),
});

export type InsertClip = z.infer<typeof insertClipSchema>;
export type Clip = typeof clips.$inferSelect;
export type CreateClipRequest = z.infer<typeof createClipRequestSchema>;
