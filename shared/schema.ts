import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const annotations = pgTable("annotations", {
  id: serial("id").primaryKey(),
  videoTime: text("video_time").notNull(), // Format: HH:MM:SS
  clipTime: text("clip_time").notNull(), // Format: HH:MM (time of day)
  date: text("date").notNull(), // Format: YYYY-MM-DD
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAnnotationSchema = createInsertSchema(annotations).omit({
  id: true,
  createdAt: true,
});

export const bookmarks = pgTable("bookmarks", {
  id: serial("id").primaryKey(),
  videoTime: text("video_time").notNull(), // Format: HH:MM:SS
  clipTime: text("clip_time").notNull(), // Format: HH:MM (time of day)
  date: text("date").notNull(), // Format: YYYY-MM-DD
  label: text("label").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertBookmarkSchema = createInsertSchema(bookmarks).omit({
  id: true,
  createdAt: true,
});

// Define the structure for S3 video clips metadata
export const clipSchema = z.object({
  key: z.string(),
  startTime: z.string(), // Format: HH:MM (time of day)
  endTime: z.string(), // Format: HH:MM (time of day)
  date: z.string(), // Format: YYYY-MM-DD
  url: z.string().optional(), // Pre-signed URL
});

export const shares = pgTable("shares", {
  id: serial("id").primaryKey(),
  clipKey: text("clip_key").notNull(),
  token: text("token").notNull().unique(),
  date: text("date").notNull(), // Format: YYYY-MM-DD
  clipTime: text("clip_time").notNull(), // Format: HH:MM (time of day)
  recipient: text("recipient").notNull(), // Email or phone number
  type: text("type").notNull(), // "email" or "sms"
  message: text("message"),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertShareSchema = createInsertSchema(shares)
  .omit({
    id: true,
    token: true,
    createdAt: true,
  })
  .extend({
    expiresAt: z.string().transform((val) => new Date(val)),
  });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertAnnotation = z.infer<typeof insertAnnotationSchema>;
export type Annotation = typeof annotations.$inferSelect;

export type InsertBookmark = z.infer<typeof insertBookmarkSchema>;
export type Bookmark = typeof bookmarks.$inferSelect;

export type InsertShare = z.infer<typeof insertShareSchema>;
export type Share = typeof shares.$inferSelect;

export type Clip = z.infer<typeof clipSchema>;
