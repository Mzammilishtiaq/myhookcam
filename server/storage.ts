import { 
  users, type User, type InsertUser, 
  annotations, type Annotation, type InsertAnnotation,
  bookmarks, type Bookmark, type InsertBookmark,
  shares, type Share, type InsertShare,
  devices, type Device, type InsertDevice,
  deviceStatus, type DeviceStatus, type InsertDeviceStatus,
  deviceRuntimes, type DeviceRuntime, type InsertDeviceRuntime,
  type Clip
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

// Storage interface for CRUD operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Annotation operations
  getAnnotations(date: string): Promise<Annotation[]>;
  getAnnotation(id: number): Promise<Annotation | undefined>;
  createAnnotation(annotation: InsertAnnotation): Promise<Annotation>;
  updateAnnotation(id: number, annotation: Partial<InsertAnnotation>): Promise<Annotation | undefined>;
  deleteAnnotation(id: number): Promise<boolean>;
  
  // Bookmark operations
  getBookmarks(date: string): Promise<Bookmark[]>;
  getBookmark(id: number): Promise<Bookmark | undefined>;
  createBookmark(bookmark: InsertBookmark): Promise<Bookmark>;
  updateBookmark(id: number, bookmark: Partial<InsertBookmark>): Promise<Bookmark | undefined>;
  deleteBookmark(id: number): Promise<boolean>;
  
  // Share operations
  getShares(): Promise<Share[]>;
  getShareByToken(token: string): Promise<Share | undefined>;
  createShare(share: InsertShare, token: string): Promise<Share>;
  deleteShare(id: number): Promise<boolean>;
  
  // IoT Device operations
  getDevices(): Promise<Device[]>;
  getDevice(id: number): Promise<Device | undefined>;
  createDevice(device: InsertDevice): Promise<Device>;
  
  // Device Status operations
  getDeviceStatus(date: string, deviceId?: number, timeframe?: "daily" | "weekly" | "monthly"): Promise<DeviceStatus[]>;
  createDeviceStatus(status: InsertDeviceStatus): Promise<DeviceStatus>;
  
  // Device Runtime operations
  getDeviceRuntime(deviceId: number | undefined, date: string, timeframe: "daily" | "weekly" | "monthly"): Promise<DeviceRuntime[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  // Annotation operations
  async getAnnotations(date: string): Promise<Annotation[]> {
    return db
      .select()
      .from(annotations)
      .where(eq(annotations.date, date))
      .orderBy(annotations.clipTime);
  }

  async getAnnotation(id: number): Promise<Annotation | undefined> {
    const result = await db.select().from(annotations).where(eq(annotations.id, id));
    return result[0];
  }

  async createAnnotation(insertAnnotation: InsertAnnotation): Promise<Annotation> {
    const result = await db.insert(annotations).values(insertAnnotation).returning();
    return result[0];
  }

  async updateAnnotation(id: number, annotation: Partial<InsertAnnotation>): Promise<Annotation | undefined> {
    const result = await db
      .update(annotations)
      .set(annotation)
      .where(eq(annotations.id, id))
      .returning();
    return result[0];
  }

  async deleteAnnotation(id: number): Promise<boolean> {
    const result = await db.delete(annotations).where(eq(annotations.id, id));
    return !!result.rowCount;
  }

  // Bookmark operations
  async getBookmarks(date: string): Promise<Bookmark[]> {
    return db
      .select()
      .from(bookmarks)
      .where(eq(bookmarks.date, date))
      .orderBy(bookmarks.clipTime);
  }

  async getBookmark(id: number): Promise<Bookmark | undefined> {
    const result = await db.select().from(bookmarks).where(eq(bookmarks.id, id));
    return result[0];
  }

  async createBookmark(insertBookmark: InsertBookmark): Promise<Bookmark> {
    const result = await db.insert(bookmarks).values(insertBookmark).returning();
    return result[0];
  }

  async updateBookmark(id: number, bookmark: Partial<InsertBookmark>): Promise<Bookmark | undefined> {
    const result = await db
      .update(bookmarks)
      .set(bookmark)
      .where(eq(bookmarks.id, id))
      .returning();
    return result[0];
  }

  async deleteBookmark(id: number): Promise<boolean> {
    const result = await db.delete(bookmarks).where(eq(bookmarks.id, id));
    return !!result.rowCount;
  }
  
  // Share operations
  async getShares(): Promise<Share[]> {
    return db
      .select()
      .from(shares)
      .orderBy(desc(shares.createdAt));
  }

  async getShareByToken(token: string): Promise<Share | undefined> {
    const result = await db.select().from(shares).where(eq(shares.token, token));
    return result[0];
  }

  async createShare(insertShare: InsertShare, token: string): Promise<Share> {
    const result = await db
      .insert(shares)
      .values({
        ...insertShare,
        token
      })
      .returning();
    return result[0];
  }

  async deleteShare(id: number): Promise<boolean> {
    const result = await db.delete(shares).where(eq(shares.id, id));
    return !!result.rowCount;
  }
  
  // IoT Device operations
  async getDevices(): Promise<Device[]> {
    return db
      .select()
      .from(devices)
      .orderBy(devices.name);
  }
  
  async getDevice(id: number): Promise<Device | undefined> {
    const result = await db.select().from(devices).where(eq(devices.id, id));
    return result[0];
  }
  
  async createDevice(insertDevice: InsertDevice): Promise<Device> {
    const result = await db.insert(devices).values(insertDevice).returning();
    return result[0];
  }
  
  // Device Status operations
  async getDeviceStatus(
    date: string, 
    deviceId?: number, 
    timeframe: "daily" | "weekly" | "monthly" = "daily"
  ): Promise<DeviceStatus[]> {
    // Create different conditions based on parameters
    let conditions = [];
    
    // Add date condition
    conditions.push(eq(deviceStatus.date, date));
    
    // Add device ID condition if provided
    if (deviceId !== undefined) {
      conditions.push(eq(deviceStatus.deviceId, deviceId));
    }
    
    // Query with all conditions
    const query = conditions.length > 1
      ? db.select().from(deviceStatus).where(and(...conditions))
      : db.select().from(deviceStatus).where(conditions[0]);
    
    return await query.orderBy(deviceStatus.timestamp);
  }
  
  async createDeviceStatus(insertStatus: InsertDeviceStatus): Promise<DeviceStatus> {
    const result = await db.insert(deviceStatus).values(insertStatus).returning();
    return result[0];
  }
  
  // Device Runtime operations
  async getDeviceRuntime(
    deviceId: number | undefined,
    date: string,
    timeframe: "daily" | "weekly" | "monthly"
  ): Promise<DeviceRuntime[]> {
    // Build conditions based on timeframe and deviceId
    const conditions = [];
    
    // Add condition based on timeframe
    if (timeframe === "daily") {
      conditions.push(eq(deviceRuntimes.date, date));
    } else if (timeframe === "weekly") {
      conditions.push(eq(deviceRuntimes.weekStartDate, date));
    } else if (timeframe === "monthly") {
      const month = date.substring(0, 7); // Extract YYYY-MM part
      conditions.push(eq(deviceRuntimes.month, month));
    }
    
    // Add device ID condition if provided
    if (deviceId !== undefined) {
      conditions.push(eq(deviceRuntimes.deviceId, deviceId));
    }
    
    // Execute query with all conditions
    const query = conditions.length > 1
      ? db.select().from(deviceRuntimes).where(and(...conditions))
      : db.select().from(deviceRuntimes).where(conditions[0]);
    
    return await query;
  }
}

// Switch from in-memory storage to database storage
export const storage = new DatabaseStorage();
