import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertAnnotationSchema, 
  insertBookmarkSchema,
  insertNoteFlagSchema,
  clipSchema,
  insertShareSchema,
  insertDeviceSchema,
  insertDeviceStatusSchema,
  insertDeviceRuntimeSchema
} from "@shared/schema";
import { S3Client, ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { z } from "zod";
import { format } from "date-fns";

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
        // For now, use a public video as a placeholder
        mockVideoUrls.set(key, `https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4`);
        console.log(`Generated mock URL for clip: ${key}`);
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
  
  // Notes/Flags API Routes (combined notes and bookmarks)
  app.get("/api/notes-flags", async (req: Request, res: Response) => {
    try {
      const date = req.query.date as string;
      if (!date) {
        return res.status(400).json({ message: "Date parameter is required" });
      }
      const notesFlags = await storage.getNotesFlags(date);
      return res.status(200).json(notesFlags);
    } catch (error) {
      console.error("Error getting notes/flags:", error);
      return res.status(500).json({ message: "Failed to get notes/flags" });
    }
  });
  
  app.get("/api/notes-flags/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid note/flag ID" });
      }
      
      const noteFlag = await storage.getNoteFlag(id);
      if (!noteFlag) {
        return res.status(404).json({ message: "Note/flag not found" });
      }
      
      return res.status(200).json(noteFlag);
    } catch (error) {
      console.error("Error getting note/flag:", error);
      return res.status(500).json({ message: "Failed to get note/flag" });
    }
  });
  
  app.post("/api/notes-flags", async (req: Request, res: Response) => {
    try {
      const result = insertNoteFlagSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid data", 
          details: result.error.format() 
        });
      }
      
      const newNoteFlag = await storage.createNoteFlag(result.data);
      return res.status(201).json(newNoteFlag);
    } catch (error) {
      console.error("Error creating note/flag:", error);
      return res.status(500).json({ message: "Failed to create note/flag" });
    }
  });
  
  app.patch("/api/notes-flags/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid note/flag ID" });
      }
      
      const noteFlag = await storage.getNoteFlag(id);
      if (!noteFlag) {
        return res.status(404).json({ message: "Note/flag not found" });
      }
      
      const updatedNoteFlag = await storage.updateNoteFlag(id, req.body);
      return res.status(200).json(updatedNoteFlag);
    } catch (error) {
      console.error("Error updating note/flag:", error);
      return res.status(500).json({ message: "Failed to update note/flag" });
    }
  });
  
  app.delete("/api/notes-flags/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid note/flag ID" });
      }
      
      const success = await storage.deleteNoteFlag(id);
      if (!success) {
        return res.status(404).json({ message: "Note/flag not found" });
      }
      
      return res.status(204).send();
    } catch (error) {
      console.error("Error deleting note/flag:", error);
      return res.status(500).json({ message: "Failed to delete note/flag" });
    }
  });
  
  // Get all shares
  app.get("/api/shares", async (req: Request, res: Response) => {
    try {
      const shares = await storage.getShares();
      return res.status(200).json(shares);
    } catch (error) {
      console.error("Error fetching shares:", error);
      return res.status(500).json({ message: "Failed to fetch shares" });
    }
  });
  
  // Get a specific share by token
  app.get("/api/shares/:token", async (req: Request, res: Response) => {
    try {
      const token = req.params.token;
      
      if (!token) {
        return res.status(400).json({ message: "Token is required" });
      }
      
      const share = await storage.getShareByToken(token);
      
      if (!share) {
        return res.status(404).json({ message: "Share not found" });
      }
      
      return res.status(200).json(share);
    } catch (error) {
      console.error("Error fetching share:", error);
      return res.status(500).json({ message: "Failed to fetch share" });
    }
  });
  
  // Create a new share
  app.post("/api/shares", async (req: Request, res: Response) => {
    try {
      const parsedBody = insertShareSchema.safeParse(req.body);
      
      if (!parsedBody.success) {
        return res.status(400).json({ message: "Invalid share data", errors: parsedBody.error });
      }
      
      // Generate a unique token for the share
      const token = Math.random().toString(36).substring(2, 15) + 
                   Math.random().toString(36).substring(2, 15);
      
      const share = await storage.createShare(parsedBody.data, token);
      
      // If it's an email share, send the email
      if (share.type === 'email') {
        try {
          const { sendEmail, generateShareEmailHtml } = await import('./email');
          
          // Generate share link
          const baseUrl = process.env.BASE_URL || `http://${req.headers.host}`;
          const shareLink = `${baseUrl}/shared/${token}`;
          
          // Parse clip date and time from the key
          const clipData = parseClipKey(share.clipKey);
          
          // Generate formatted email
          const html = generateShareEmailHtml(
            shareLink,
            clipData?.date || share.date,
            clipData?.startTime || share.clipTime,
            share.message || undefined
          );
          
          // Generate plain text version
          const text = `A video clip has been shared with you from our Video Timeline Portal.
Date: ${clipData?.date || share.date}
Time: ${clipData?.startTime || share.clipTime}
${share.message ? `Message: ${share.message}\n` : ''}
View here: ${shareLink}`;
          
          // Send the email
          const emailSent = await sendEmail({
            to: share.recipient,
            subject: "Video Clip Shared With You",
            text,
            html,
          });
          
          if (!emailSent) {
            console.error("Failed to send email for share:", share.id);
            // We continue anyway as the share was created successfully
          }
        } catch (emailError) {
          console.error("Email send error:", emailError);
          // We continue anyway as the share was created successfully
        }
      }
      
      // If it's an SMS share, send the SMS using our mock functionality
      if (share.type === 'sms') {
        try {
          const { generateShareTextMessage } = await import('./email');
          const { sendSMS } = await import('./sms');
          
          // Generate share link
          const baseUrl = process.env.BASE_URL || `http://${req.headers.host}`;
          const shareLink = `${baseUrl}/shared/${token}`;
          
          // Parse clip date and time from the key
          const clipData = parseClipKey(share.clipKey);
          
          // Generate SMS message
          const messageBody = generateShareTextMessage(
            shareLink,
            clipData?.date || share.date,
            clipData?.startTime || share.clipTime,
            share.message || undefined
          );
          
          // Send the SMS using our mock function
          const smsSent = await sendSMS({
            to: share.recipient,
            body: messageBody
          });
          
          if (!smsSent) {
            console.error("Failed to send SMS for share:", share.id);
            // We continue anyway as the share was created successfully
          }
        } catch (smsError) {
          console.error("SMS prepare error:", smsError);
          // We continue anyway as the share was created successfully
        }
      }
      
      return res.status(201).json(share);
    } catch (error) {
      console.error("Error creating share:", error);
      return res.status(500).json({ message: "Failed to create share" });
    }
  });
  
  // Delete a share
  app.delete("/api/shares/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid share ID" });
      }
      
      const success = await storage.deleteShare(id);
      
      if (!success) {
        return res.status(404).json({ message: "Share not found" });
      }
      
      return res.status(204).send();
    } catch (error) {
      console.error("Error deleting share:", error);
      return res.status(500).json({ message: "Failed to delete share" });
    }
  });

  // Device IoT monitoring endpoints
  
  // Get all devices
  app.get("/api/devices", async (req: Request, res: Response) => {
    try {
      const devices = await storage.getDevices();
      return res.status(200).json(devices);
    } catch (error) {
      console.error("Error fetching devices:", error);
      return res.status(500).json({ message: "Failed to fetch devices" });
    }
  });

  // Create a new device
  app.post("/api/devices", async (req: Request, res: Response) => {
    try {
      const parsedBody = insertDeviceSchema.safeParse(req.body);
      
      if (!parsedBody.success) {
        return res.status(400).json({ message: "Invalid device data", errors: parsedBody.error });
      }
      
      const device = await storage.createDevice(parsedBody.data);
      return res.status(201).json(device);
    } catch (error) {
      console.error("Error creating device:", error);
      return res.status(500).json({ message: "Failed to create device" });
    }
  });

  // Get device status for a specific date and timeframe
  app.get("/api/device-status", async (req: Request, res: Response) => {
    try {
      const date = req.query.date as string;
      const deviceId = req.query.deviceId ? parseInt(req.query.deviceId as string) : undefined;
      const timeframe = (req.query.timeframe as "daily" | "weekly" | "monthly") || "daily";
      
      if (!date) {
        return res.status(400).json({ message: "Date parameter is required" });
      }
      
      // Get device status data
      const statusData = await storage.getDeviceStatus(date, deviceId, timeframe);
      
      // For development, return mock data if no real data exists
      if (statusData.length === 0) {
        const mockStatusData = generateMockDeviceStatus(date, deviceId || 1, timeframe);
        return res.status(200).json(mockStatusData);
      }
      
      return res.status(200).json(statusData);
    } catch (error) {
      console.error("Error fetching device status:", error);
      return res.status(500).json({ message: "Failed to fetch device status" });
    }
  });

  // Record device status
  app.post("/api/device-status", async (req: Request, res: Response) => {
    try {
      const parsedBody = insertDeviceStatusSchema.safeParse(req.body);
      
      if (!parsedBody.success) {
        return res.status(400).json({ message: "Invalid device status data", errors: parsedBody.error });
      }
      
      const deviceStatus = await storage.createDeviceStatus(parsedBody.data);
      return res.status(201).json(deviceStatus);
    } catch (error) {
      console.error("Error recording device status:", error);
      return res.status(500).json({ message: "Failed to record device status" });
    }
  });

  // Get device runtime statistics
  app.get("/api/device-runtime", async (req: Request, res: Response) => {
    try {
      const deviceId = req.query.deviceId ? parseInt(req.query.deviceId as string) : undefined;
      const timeframe = (req.query.timeframe as "daily" | "weekly" | "monthly") || "daily";
      const date = req.query.date as string;
      
      if (!date) {
        return res.status(400).json({ message: "Date parameter is required" });
      }
      
      // Get runtime statistics
      const runtimeStats = await storage.getDeviceRuntime(deviceId, date, timeframe);
      
      // For development, return mock data if no real data exists
      if (runtimeStats.length === 0) {
        // Mock runtime based on device and timeframe
        const mockRuntime = generateMockDeviceRuntime(deviceId || 1, timeframe);
        return res.status(200).json([mockRuntime]);
      }
      
      return res.status(200).json(runtimeStats);
    } catch (error) {
      console.error("Error fetching runtime statistics:", error);
      return res.status(500).json({ message: "Failed to fetch runtime statistics" });
    }
  });

  // Helper function to generate mock device status data
  function generateMockDeviceStatus(date: string, deviceId: number, timeframe: "daily" | "weekly" | "monthly") {
    let incrementsPerUnit = 288; // 5-minute increments in a day (24 * 12)
    let units = 1; // default to 1 day
    
    if (timeframe === "weekly") {
      units = 7; // 7 days per week
    } else if (timeframe === "monthly") {
      units = 30; // ~30 days per month
    }
    
    const totalIncrements = incrementsPerUnit * units;
    const statusData = [];
    
    for (let i = 0; i < totalIncrements; i++) {
      const day = Math.floor(i / incrementsPerUnit);
      const dayIncrement = i % incrementsPerUnit;
      const hour = Math.floor(dayIncrement / 12);
      const minuteIncrement = dayIncrement % 12;
      const minute = minuteIncrement * 5;
      
      const timeLabel = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const dayOffset = day; // For multi-day timeframes
      
      // Calculate timestamp
      let timestamp = new Date(date);
      timestamp.setHours(hour, minute, 0, 0);
      if (dayOffset > 0) {
        timestamp.setDate(timestamp.getDate() + dayOffset);
      }
      
      // Random status with 90-95% chance of being online (based on device)
      const reliability = 0.9 + (deviceId % 5) * 0.01; // Different reliability per device
      const isOnline = Math.random() < reliability;
      
      statusData.push({
        id: i + 1, // Mock ID
        deviceId,
        timestamp: timestamp.toISOString(),
        status: isOnline ? 'online' : 'offline',
        date: format(timestamp, 'yyyy-MM-dd'),
        timePoint: timeLabel,
        createdAt: new Date().toISOString()
      });
    }
    
    return statusData;
  }

  // Helper function to generate mock device runtime data
  function generateMockDeviceRuntime(deviceId: number, timeframe: "daily" | "weekly" | "monthly") {
    // Base reliability varies slightly between devices for more realistic data
    const baseReliability = 0.85 + (deviceId % 5) * 0.02;
    
    let runtimeMinutes: number;
    
    // Calculate runtime based on timeframe
    if (timeframe === "daily") {
      runtimeMinutes = Math.floor(24 * 60 * baseReliability * (0.95 + Math.random() * 0.05));
    } else if (timeframe === "weekly") {
      runtimeMinutes = Math.floor(7 * 24 * 60 * baseReliability * (0.95 + Math.random() * 0.05));
    } else { // monthly
      runtimeMinutes = Math.floor(30 * 24 * 60 * baseReliability * (0.90 + Math.random() * 0.08));
    }
    
    return {
      id: 1, // Mock ID
      deviceId,
      date: new Date().toISOString().split('T')[0],
      weekStartDate: timeframe === "weekly" ? new Date().toISOString().split('T')[0] : null,
      month: timeframe === "monthly" ? new Date().toISOString().split('T')[0].substring(0, 7) : null,
      runtimeMinutes,
      type: timeframe,
      updatedAt: new Date().toISOString()
    };
  }

  const httpServer = createServer(app);
  return httpServer;
}
