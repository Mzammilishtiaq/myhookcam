import { apiRequest } from "./queryClient";
import type { Clip } from "@shared/schema";

// Fetch clips for a specific date
export async function fetchClips(date: string): Promise<Clip[]> {
  const response = await fetch(`/api/clips?date=${date}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch clips: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

// Get a signed URL for a specific clip
export async function getClipUrl(key: string): Promise<string> {
  const response = await fetch(`/api/clips/${encodeURIComponent(key)}/url`);
  
  if (!response.ok) {
    throw new Error(`Failed to get clip URL: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.url;
}

// Fetch video as blob for export
export async function fetchVideoBlob(key: string): Promise<Blob> {
  // First get the signed URL
  const url = await getClipUrl(key);
  
  // Then fetch the video data
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch video: ${response.status} ${response.statusText}`);
  }
  
  return response.blob();
}
