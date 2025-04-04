import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertAnnotationSchema, 
  insertBookmarkSchema,
  clipSchema
} from "@shared/schema";
import { S3Client, ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { z } from "zod";

// Initialize AWS S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || "video-timeline-bucket";

// Calculate end time (start + 5 minutes)
function calculateEndTime(hours: string, minutes: string): string {
  let endHours = parseInt(hours);
  let endMinutes = parseInt(minutes) + 5;
  
  if (endMinutes >= 60) {
    endHours = (endHours + 1) % 24;
    endMinutes = endMinutes % 60;
  }
  
  return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
}

// Generate mock clips for development
function generateMockClips(date: string) {
  const clips = [];
  
  // Create clips every 5 minutes from 7am to 5pm (working hours)
  // With some random gaps to simulate missing footage
  for (let hour = 7; hour <= 17; hour++) {
    for (let minute = 0; minute < 60; minute += 5) {
      // Randomly skip some time slots (30% chance)
      if (Math.random() > 0.3) {
        const hours = hour.toString().padStart(2, '0');
        const minutes = minute.toString().padStart(2, '0');
        
        // Create a unique key for the clip
        const key = `${date}_${hours}${minutes}.mp4`;
        
        clips.push({
          key,
          date,
          startTime: `${hours}:${minutes}`,
          endTime: calculateEndTime(hours, minutes),
          url: ""
        });
      }
    }
  }
  
  // Add a few more clips outside working hours
  for (let hour = 0; hour < 7; hour += 2) {
    const minute = Math.floor(Math.random() * 12) * 5; // Random 5-minute interval
    const hours = hour.toString().padStart(2, '0');
    const minutes = minute.toString().padStart(2, '0');
    
    const key = `${date}_${hours}${minutes}.mp4`;
    
    clips.push({
      key,
      date,
      startTime: `${hours}:${minutes}`,
      endTime: calculateEndTime(hours, minutes),
      url: ""
    });
  }
  
  // And a few more clips after working hours
  for (let hour = 18; hour < 24; hour += 2) {
    const minute = Math.floor(Math.random() * 12) * 5; // Random 5-minute interval
    const hours = hour.toString().padStart(2, '0');
    const minutes = minute.toString().padStart(2, '0');
    
    const key = `${date}_${hours}${minutes}.mp4`;
    
    clips.push({
      key,
      date,
      startTime: `${hours}:${minutes}`,
      endTime: calculateEndTime(hours, minutes),
      url: ""
    });
  }
  
  // Sort clips by start time
  return clips.sort((a, b) => a.startTime.localeCompare(b.startTime));
}

// Cache for mock video URLs
const mockVideoUrls = new Map<string, string>();

// Parse video clip key to extract metadata
function parseClipKey(key: string) {
  // Assuming filename format: YYYY-MM-DD_HHMM.mp4
  // Example: 2023-07-05_1015.mp4 (for a clip at 10:15 AM on July 5, 2023)
  const regex = /(\d{4}-\d{2}-\d{2})_(\d{2})(\d{2})\.mp4$/;
  const match = key.match(regex);
  
  if (!match) return null;
  
  const [_, date, hours, minutes] = match;
  const startTime = `${hours}:${minutes}`;
  const endTime = calculateEndTime(hours, minutes);
  
  return {
    key,
    date,
    startTime,
    endTime
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes prefixed with /api
  
  // Get video clips for a specific date
  app.get("/api/clips", async (req: Request, res: Response) => {
    try {
      const date = req.query.date as string || new Date().toISOString().split('T')[0];
      
      if (!date) {
        return res.status(400).json({ message: "Date parameter is required" });
      }
      
      // For development, use mock clips instead of accessing S3
      const clips = generateMockClips(date);
      
      return res.status(200).json(clips);
    } catch (error) {
      console.error("Error fetching clips:", error);
      return res.status(500).json({ message: "Failed to fetch clips" });
    }
  });
  
  // Get mock URL for a specific clip
  app.get("/api/clips/:key/url", async (req: Request, res: Response) => {
    try {
      const key = decodeURIComponent(req.params.key);
      
      // Generate a mock video URL or return a previously generated one
      if (!mockVideoUrls.has(key)) {
        // In a real implementation, this would be a pre-signed S3 URL
        mockVideoUrls.set(key, `https://example.com/mock-video/${key}`);
      }
      
      return res.status(200).json({ url: mockVideoUrls.get(key) });
    } catch (error) {
      console.error("Error generating mock URL:", error);
      return res.status(500).json({ message: "Failed to generate URL" });
    }
  });
  
  // Get all annotations for a specific date
  app.get("/api/annotations", async (req: Request, res: Response) => {
    try {
      const date = req.query.date as string;
      
      if (!date) {
        return res.status(400).json({ message: "Date parameter is required" });
      }
      
      const annotations = await storage.getAnnotations(date);
      return res.status(200).json(annotations);
    } catch (error) {
      console.error("Error fetching annotations:", error);
      return res.status(500).json({ message: "Failed to fetch annotations" });
    }
  });
  
  // Create a new annotation
  app.post("/api/annotations", async (req: Request, res: Response) => {
    try {
      const parsedBody = insertAnnotationSchema.safeParse(req.body);
      
      if (!parsedBody.success) {
        return res.status(400).json({ message: "Invalid annotation data", errors: parsedBody.error });
      }
      
      const annotation = await storage.createAnnotation(parsedBody.data);
      return res.status(201).json(annotation);
    } catch (error) {
      console.error("Error creating annotation:", error);
      return res.status(500).json({ message: "Failed to create annotation" });
    }
  });
  
  // Update an existing annotation
  app.patch("/api/annotations/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid annotation ID" });
      }
      
      const existingAnnotation = await storage.getAnnotation(id);
      
      if (!existingAnnotation) {
        return res.status(404).json({ message: "Annotation not found" });
      }
      
      const parsedBody = insertAnnotationSchema.partial().safeParse(req.body);
      
      if (!parsedBody.success) {
        return res.status(400).json({ message: "Invalid annotation data", errors: parsedBody.error });
      }
      
      const updatedAnnotation = await storage.updateAnnotation(id, parsedBody.data);
      return res.status(200).json(updatedAnnotation);
    } catch (error) {
      console.error("Error updating annotation:", error);
      return res.status(500).json({ message: "Failed to update annotation" });
    }
  });
  
  // Delete an annotation
  app.delete("/api/annotations/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid annotation ID" });
      }
      
      const success = await storage.deleteAnnotation(id);
      
      if (!success) {
        return res.status(404).json({ message: "Annotation not found" });
      }
      
      return res.status(204).send();
    } catch (error) {
      console.error("Error deleting annotation:", error);
      return res.status(500).json({ message: "Failed to delete annotation" });
    }
  });
  
  // Get all bookmarks for a specific date
  app.get("/api/bookmarks", async (req: Request, res: Response) => {
    try {
      const date = req.query.date as string;
      
      if (!date) {
        return res.status(400).json({ message: "Date parameter is required" });
      }
      
      const bookmarks = await storage.getBookmarks(date);
      return res.status(200).json(bookmarks);
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
      return res.status(500).json({ message: "Failed to fetch bookmarks" });
    }
  });
  
  // Create a new bookmark
  app.post("/api/bookmarks", async (req: Request, res: Response) => {
    try {
      const parsedBody = insertBookmarkSchema.safeParse(req.body);
      
      if (!parsedBody.success) {
        return res.status(400).json({ message: "Invalid bookmark data", errors: parsedBody.error });
      }
      
      const bookmark = await storage.createBookmark(parsedBody.data);
      return res.status(201).json(bookmark);
    } catch (error) {
      console.error("Error creating bookmark:", error);
      return res.status(500).json({ message: "Failed to create bookmark" });
    }
  });
  
  // Update an existing bookmark
  app.patch("/api/bookmarks/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid bookmark ID" });
      }
      
      const existingBookmark = await storage.getBookmark(id);
      
      if (!existingBookmark) {
        return res.status(404).json({ message: "Bookmark not found" });
      }
      
      const parsedBody = insertBookmarkSchema.partial().safeParse(req.body);
      
      if (!parsedBody.success) {
        return res.status(400).json({ message: "Invalid bookmark data", errors: parsedBody.error });
      }
      
      const updatedBookmark = await storage.updateBookmark(id, parsedBody.data);
      return res.status(200).json(updatedBookmark);
    } catch (error) {
      console.error("Error updating bookmark:", error);
      return res.status(500).json({ message: "Failed to update bookmark" });
    }
  });
  
  // Delete a bookmark
  app.delete("/api/bookmarks/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid bookmark ID" });
      }
      
      const success = await storage.deleteBookmark(id);
      
      if (!success) {
        return res.status(404).json({ message: "Bookmark not found" });
      }
      
      return res.status(204).send();
    } catch (error) {
      console.error("Error deleting bookmark:", error);
      return res.status(500).json({ message: "Failed to delete bookmark" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
