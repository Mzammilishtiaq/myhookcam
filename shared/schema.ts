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

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertAnnotation = z.infer<typeof insertAnnotationSchema>;
export type Annotation = typeof annotations.$inferSelect;

export type InsertBookmark = z.infer<typeof insertBookmarkSchema>;
export type Bookmark = typeof bookmarks.$inferSelect;

export type Clip = z.infer<typeof clipSchema>;
