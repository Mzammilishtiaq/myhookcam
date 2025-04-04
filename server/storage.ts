import { 
  users, type User, type InsertUser, 
  annotations, type Annotation, type InsertAnnotation,
  bookmarks, type Bookmark, type InsertBookmark,
  shares, type Share, type InsertShare,
  type Clip
} from "@shared/schema";

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private annotations: Map<number, Annotation>;
  private bookmarks: Map<number, Bookmark>;
  private shares: Map<number, Share>;
  private userId: number;
  private annotationId: number;
  private bookmarkId: number;
  private shareId: number;

  constructor() {
    this.users = new Map();
    this.annotations = new Map();
    this.bookmarks = new Map();
    this.shares = new Map();
    this.userId = 1;
    this.annotationId = 1;
    this.bookmarkId = 1;
    this.shareId = 1;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Annotation operations
  async getAnnotations(date: string): Promise<Annotation[]> {
    return Array.from(this.annotations.values()).filter(
      (annotation) => annotation.date === date
    ).sort((a, b) => {
      return a.clipTime.localeCompare(b.clipTime);
    });
  }

  async getAnnotation(id: number): Promise<Annotation | undefined> {
    return this.annotations.get(id);
  }

  async createAnnotation(insertAnnotation: InsertAnnotation): Promise<Annotation> {
    const id = this.annotationId++;
    const now = new Date();
    const annotation: Annotation = { 
      ...insertAnnotation, 
      id, 
      createdAt: now 
    };
    this.annotations.set(id, annotation);
    return annotation;
  }

  async updateAnnotation(id: number, annotation: Partial<InsertAnnotation>): Promise<Annotation | undefined> {
    const existingAnnotation = this.annotations.get(id);
    if (!existingAnnotation) return undefined;

    const updatedAnnotation: Annotation = {
      ...existingAnnotation,
      ...annotation,
    };
    this.annotations.set(id, updatedAnnotation);
    return updatedAnnotation;
  }

  async deleteAnnotation(id: number): Promise<boolean> {
    return this.annotations.delete(id);
  }

  // Bookmark operations
  async getBookmarks(date: string): Promise<Bookmark[]> {
    return Array.from(this.bookmarks.values()).filter(
      (bookmark) => bookmark.date === date
    ).sort((a, b) => {
      return a.clipTime.localeCompare(b.clipTime);
    });
  }

  async getBookmark(id: number): Promise<Bookmark | undefined> {
    return this.bookmarks.get(id);
  }

  async createBookmark(insertBookmark: InsertBookmark): Promise<Bookmark> {
    const id = this.bookmarkId++;
    const now = new Date();
    const bookmark: Bookmark = { 
      ...insertBookmark, 
      id, 
      createdAt: now 
    };
    this.bookmarks.set(id, bookmark);
    return bookmark;
  }

  async updateBookmark(id: number, bookmark: Partial<InsertBookmark>): Promise<Bookmark | undefined> {
    const existingBookmark = this.bookmarks.get(id);
    if (!existingBookmark) return undefined;

    const updatedBookmark: Bookmark = {
      ...existingBookmark,
      ...bookmark,
    };
    this.bookmarks.set(id, updatedBookmark);
    return updatedBookmark;
  }

  async deleteBookmark(id: number): Promise<boolean> {
    return this.bookmarks.delete(id);
  }
  
  // Share operations
  async getShares(): Promise<Share[]> {
    return Array.from(this.shares.values()).sort((a, b) => {
      // Sort shares by creation date (most recent first)
      if (a.createdAt && b.createdAt) {
        return b.createdAt.getTime() - a.createdAt.getTime();
      }
      return 0;
    });
  }

  async getShareByToken(token: string): Promise<Share | undefined> {
    return Array.from(this.shares.values()).find(
      (share) => share.token === token
    );
  }

  async createShare(insertShare: InsertShare, token: string): Promise<Share> {
    const id = this.shareId++;
    const now = new Date();
    
    // Create share by explicitly setting each property to avoid type issues
    const share: Share = {
      id,
      token,
      createdAt: now,
      date: insertShare.date,
      clipTime: insertShare.clipTime,
      clipKey: insertShare.clipKey,
      recipient: insertShare.recipient,
      type: insertShare.type,
      message: insertShare.message || null,
      expiresAt: insertShare.expiresAt
    };
    
    this.shares.set(id, share);
    return share;
  }

  async deleteShare(id: number): Promise<boolean> {
    return this.shares.delete(id);
  }
}

export const storage = new MemStorage();
