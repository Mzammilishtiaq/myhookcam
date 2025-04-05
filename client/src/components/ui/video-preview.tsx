import { useRef, useEffect } from 'react';
import { getClipUrl } from "@/lib/s3";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import type { Clip } from "@shared/schema";

interface VideoPreviewProps {
  // Support both clip object and key string for flexibility
  clip?: Clip;
  clipKey?: string;
  position?: number;
  onPositionChange?: (pos: number) => void;
  previewTimeOffset?: number; // Optional time offset for preview in seconds
  className?: string;
}

export function VideoPreview({ 
  clip, 
  clipKey, 
  position = 50, 
  onPositionChange,
  previewTimeOffset = 0,
  className = ""
}: VideoPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Use either the clip's key or the clipKey parameter
  const key = clip?.key || clipKey;
  
  // Fetch the signed URL for the clip
  const { 
    data: clipUrl, 
    isLoading: isLoadingUrl 
  } = useQuery({
    queryKey: [`/api/clips/${key}/url`],
    queryFn: () => getClipUrl(key || ''),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!key // Only run the query if we have a key
  });
  
  // Update preview position when position changes
  useEffect(() => {
    if (videoRef.current && clipUrl) {
      // Set the video to the preview position - 5 minutes is 300 seconds
      const duration = 300; // Default to 5 minutes
      const timePosition = (position / 100) * duration + previewTimeOffset;
      
      // Don't seek if the video isn't ready
      if (videoRef.current.readyState >= 2) {
        videoRef.current.currentTime = Math.min(timePosition, duration);
      }
    }
  }, [position, clipUrl, previewTimeOffset]);
  
  // Handle video loaded data to seek to the right position
  const handleLoadedData = () => {
    if (videoRef.current) {
      const duration = videoRef.current.duration || 300;
      const timePosition = (position / 100) * duration + previewTimeOffset;
      videoRef.current.currentTime = Math.min(timePosition, duration);
    }
  };
  
  // Handle manual seeking in the preview
  const handleTimeUpdate = () => {
    if (videoRef.current && onPositionChange) {
      const duration = videoRef.current.duration || 300;
      const newPosition = (videoRef.current.currentTime / duration) * 100;
      onPositionChange(newPosition);
    }
  };
  
  // Display the clip time (time of day)
  const clipTimeDisplay = clip ? clip.startTime : "--:--";
  
  return (
    <div className={`video-preview-container relative bg-black overflow-hidden ${className}`}>
      {/* Loading overlay */}
      <div className={`absolute inset-0 flex items-center justify-center bg-[#000000] bg-opacity-70 z-10 transition-opacity duration-300 ${isLoadingUrl ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <Loader2 className="h-6 w-6 text-[#FBBC05] animate-spin" />
      </div>
      
      {/* Video element */}
      <video 
        ref={videoRef}
        className="w-full h-full object-cover"
        src={clipUrl}
        muted
        preload="auto"
        onLoadedData={handleLoadedData}
        onTimeUpdate={handleTimeUpdate}
        style={{ opacity: isLoadingUrl ? 0 : 1 }}
      />
      
      {/* Only show overlays when explicitly using the full component */}
      {clip && (
        <>
          {/* Video info overlay */}
          <div className="absolute top-1 left-1 bg-[#000000] bg-opacity-70 text-[#FFFFFF] px-1.5 py-0.5 rounded text-xs font-mono border border-[#FBBC05]">
            <span>{clipTimeDisplay}</span>
          </div>
          
          {/* Debug info */}
          <div className="absolute bottom-1 right-1 bg-[#000000] bg-opacity-70 text-[#FFFFFF] px-1.5 py-0.5 rounded text-xs font-mono opacity-50 hover:opacity-100">
            <span>{Math.round(position)}%</span>
          </div>
        </>
      )}
    </div>
  );
}