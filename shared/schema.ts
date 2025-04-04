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

// Health IoT device monitoring schemas
export const devices = pgTable("devices", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  ipAddress: text("ip_address").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertDeviceSchema = createInsertSchema(devices).omit({
  id: true,
  createdAt: true,
});

export const deviceStatus = pgTable("device_status", {
  id: serial("id").primaryKey(),
  deviceId: integer("device_id").notNull(),
  timestamp: timestamp("timestamp").notNull(),
  status: text("status").notNull(), // 'online' or 'offline'
  date: text("date").notNull(), // Format: YYYY-MM-DD
  timePoint: text("time_point").notNull(), // Format: HH:MM (5-minute increments)
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertDeviceStatusSchema = createInsertSchema(deviceStatus).omit({
  id: true,
  createdAt: true,
});

// Schema for runtime statistics
export const deviceRuntimes = pgTable("device_runtimes", {
  id: serial("id").primaryKey(),
  deviceId: integer("device_id").notNull(),
  date: text("date").notNull(), // Format: YYYY-MM-DD
  weekStartDate: text("week_start_date"), // Start date of the week
  month: text("month"), // Format: YYYY-MM
  runtimeMinutes: integer("runtime_minutes").notNull(),
  type: text("type").notNull(), // 'daily', 'weekly', or 'monthly'
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertDeviceRuntimeSchema = createInsertSchema(deviceRuntimes).omit({
  id: true,
  updatedAt: true,
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

// Health IoT types
export type InsertDevice = z.infer<typeof insertDeviceSchema>;
export type Device = typeof devices.$inferSelect;

export type InsertDeviceStatus = z.infer<typeof insertDeviceStatusSchema>;
export type DeviceStatus = typeof deviceStatus.$inferSelect;

export type InsertDeviceRuntime = z.infer<typeof insertDeviceRuntimeSchema>;
export type DeviceRuntime = typeof deviceRuntimes.$inferSelect;
