import type { Express, Request, Response } from "express";
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

// Parse video clip key to extract metadata
function parseClipKey(key: string) {
  // Assuming filename format: YYYY-MM-DD_HHMM.mp4
  // Example: 2023-07-05_1015.mp4 (for a clip at 10:15 AM on July 5, 2023)
  const regex = /(\d{4}-\d{2}-\d{2})_(\d{2})(\d{2})\.mp4$/;
  const match = key.match(regex);
  
  if (!match) return null;
  
  const [_, date, hours, minutes] = match;
  const startTime = `${hours}:${minutes}`;
  
  // Calculate end time (start + 5 minutes)
  let endHours = parseInt(hours);
  let endMinutes = parseInt(minutes) + 5;
  
  if (endMinutes >= 60) {
    endHours = (endHours + 1) % 24;
    endMinutes = endMinutes % 60;
  }
  
  const endTime = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  
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
      const date = req.query.date as string;
      
      if (!date) {
        return res.status(400).json({ message: "Date parameter is required" });
      }
      
      // List objects in the S3 bucket with the date prefix
      const command = new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
        Prefix: date,
      });
      
      const response = await s3Client.send(command);
      
      // Parse clip metadata from the keys
      const clips = (response.Contents || [])
        .map(obj => parseClipKey(obj.Key || ""))
        .filter(Boolean)
        .map(clipData => ({
          ...clipData,
          url: "" // Will be populated with signed URLs when needed
        }));
      
      return res.status(200).json(clips);
    } catch (error) {
      console.error("Error fetching clips:", error);
      return res.status(500).json({ message: "Failed to fetch clips" });
    }
  });
  
  // Get signed URL for a specific clip
  app.get("/api/clips/:key/url", async (req: Request, res: Response) => {
    try {
      const key = decodeURIComponent(req.params.key);
      
      // Create a GetObject command
      const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      });
      
      // Generate a signed URL that's valid for 1 hour
      const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
      
      return res.status(200).json({ url: signedUrl });
    } catch (error) {
      console.error("Error generating signed URL:", error);
      return res.status(500).json({ message: "Failed to generate video URL" });
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
