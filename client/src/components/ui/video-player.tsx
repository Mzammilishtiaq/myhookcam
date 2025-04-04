import { useEffect, useRef, useState } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, Volume, Maximize, Loader2 } from "lucide-react";
import { formatTime } from "@/lib/time";
import { getClipUrl } from "@/lib/s3";
import { useQuery } from "@tanstack/react-query";
import type { Clip } from "@shared/schema";

interface VideoPlayerProps {
  clip?: Clip;
  nextClip?: Clip;
  isPlaying: boolean;
  currentTime: number;
  onTimeUpdate: (time: number) => void;
  onEnded: () => void;
  onPlayPause: (isPlaying: boolean) => void;
}

export function VideoPlayer({
  clip,
  nextClip,
  isPlaying,
  currentTime,
  onTimeUpdate,
  onEnded,
  onPlayPause
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const preloadVideoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  
  // Fetch the signed URL for the current clip
  const { 
    data: clipUrl, 
    isLoading: isLoadingUrl 
  } = useQuery({
    queryKey: ['/api/clips/url', clip?.key],
    queryFn: () => clip ? getClipUrl(clip.key) : Promise.resolve(""),
    enabled: !!clip
  });
  
  // Preload the next clip if available
  const { data: nextClipUrl } = useQuery({
    queryKey: ['/api/clips/url', nextClip?.key],
    queryFn: () => nextClip ? getClipUrl(nextClip.key) : Promise.resolve(""),
    enabled: !!nextClip
  });
  
  // Handle play/pause
  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(err => {
          console.error("Error playing video:", err);
          onPlayPause(false);
        });
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, clipUrl]);
  
  // Handle mute/unmute
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
    if (preloadVideoRef.current) {
      preloadVideoRef.current.muted = true; // Always mute preload video
    }
  }, [isMuted]);
  
  // Preload next video
  useEffect(() => {
    if (preloadVideoRef.current && nextClipUrl) {
      preloadVideoRef.current.src = nextClipUrl;
      preloadVideoRef.current.load();
    }
  }, [nextClipUrl]);
  
  // Update progress bar
  useEffect(() => {
    if (progressRef.current && videoRef.current) {
      const duration = videoRef.current.duration || 300; // Default to 5 minutes (300 seconds)
      const progressPercent = (currentTime / duration) * 100;
      progressRef.current.style.width = `${progressPercent}%`;
    }
  }, [currentTime]);
  
  // Handle time updates
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      onTimeUpdate(videoRef.current.currentTime);
    }
  };
  
  // Handle play/pause toggle
  const togglePlay = () => {
    onPlayPause(!isPlaying);
  };
  
  // Handle mute toggle
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };
  
  // Handle fullscreen
  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };
  
  // Format displayed current time
  const formattedCurrentTime = formatTime(currentTime);
  const formattedDuration = formatTime(videoRef.current?.duration || 300);
  
  // Display the clip time (time of day)
  const clipTimeDisplay = clip ? clip.startTime : "--:--";
  
  return (
    <div className="video-player-container bg-[#000000] rounded-lg shadow-lg overflow-hidden mb-8 border border-[#BCBBBB]">
      <div className="relative">
        {/* Main video element */}
        <video 
          ref={videoRef}
          className="w-full aspect-video bg-[#555555]"
          src={clipUrl}
          onTimeUpdate={handleTimeUpdate}
          onEnded={onEnded}
        >
          Your browser does not support the video tag.
        </video>
        
        {/* Preload next video (hidden) */}
        <video 
          ref={preloadVideoRef}
          className="hidden"
          preload="auto"
          muted
        />
        
        {/* Loading indicator */}
        {isLoadingUrl && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#000000] bg-opacity-70">
            <Loader2 className="h-12 w-12 text-[#FBBC05] animate-spin" />
          </div>
        )}
        
        {/* Video info overlay */}
        <div className="absolute top-4 left-4 bg-[#000000] bg-opacity-70 text-[#FFFFFF] px-3 py-1 rounded text-sm font-mono border border-[#FBBC05]">
          <span>{clipTimeDisplay}</span>
        </div>
        
        {/* Video controls */}
        <div className="video-controls absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#000000] to-transparent p-4 flex items-center">
          <button 
            className="text-[#FFFFFF] p-2 rounded-full hover:bg-[#FBBC05] hover:bg-opacity-20"
            onClick={togglePlay}
          >
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </button>
          
          <button 
            className="text-[#FFFFFF] p-2 rounded-full hover:bg-[#FBBC05] hover:bg-opacity-20"
            onClick={() => onEnded()} // Skip to next clip
          >
            <SkipForward className="h-5 w-5" />
          </button>
          
          <div className="mx-2 text-[#FFFFFF] font-mono text-sm">
            {formattedCurrentTime} / {formattedDuration}
          </div>
          
          <div className="flex-grow mx-2 h-1 bg-[#BCBBBB] rounded-full overflow-hidden">
            <div 
              ref={progressRef}
              className="h-full bg-[#FBBC05] rounded-full"
            ></div>
          </div>
          
          <button 
            className="text-[#FFFFFF] p-2 rounded-full hover:bg-[#FBBC05] hover:bg-opacity-20"
            onClick={toggleMute}
          >
            {isMuted ? <Volume className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </button>
          
          <button 
            className="text-[#FFFFFF] p-2 rounded-full hover:bg-[#FBBC05] hover:bg-opacity-20"
            onClick={toggleFullscreen}
          >
            <Maximize className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
