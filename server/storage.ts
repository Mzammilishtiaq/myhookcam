import { 
  users, type User, type InsertUser, 
  annotations, type Annotation, type InsertAnnotation,
  bookmarks, type Bookmark, type InsertBookmark,
  shares, type Share, type InsertShare,
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
      .orderBy(shares.createdAt, { direction: 'desc' });
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
    return result.count > 0;
  }
}

// Switch from in-memory storage to database storage
export const storage = new DatabaseStorage();
