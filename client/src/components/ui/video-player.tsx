import { useEffect, useRef, useState } from "react";
import { 
  Play, Pause, SkipForward, Volume2, Volume, Maximize, Loader2,
  ZoomIn, ZoomOut, MoveHorizontal, MoveVertical, RotateCcw, FastForward, Rewind,
  ArrowUp, ArrowDown, ArrowLeft, ArrowRight
} from "lucide-react";
import { formatTime } from "@/lib/time";
import { getClipUrl } from "@/lib/s3";
import { useQuery } from "@tanstack/react-query";
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
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
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  
  // Playback speed state
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const playbackRates = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];
  
  // Video zoom and pan state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
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
  
  // Handle playback speed change
  const changePlaybackRate = (rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setPlaybackRate(rate);
    }
  };
  
  // Handle zoom controls
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  };
  
  const handleZoomOut = () => {
    setZoom(prev => {
      if (prev <= 1) return 1;
      return prev - 0.25;
    });
    
    // If zooming out to 1, reset pan
    if (zoom <= 1.25) {
      setPan({ x: 0, y: 0 });
    }
  };
  
  const handleZoomReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };
  
  // Pan handlers for mouse/touch interactions
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging && zoom > 1) {
      const dx = (e.clientX - dragStart.x) / (zoom * 10);
      const dy = (e.clientY - dragStart.y) / (zoom * 10);
      
      setPan(prev => ({ 
        x: Math.max(-10, Math.min(10, prev.x + dx)), 
        y: Math.max(-10, Math.min(10, prev.y + dy)) 
      }));
      
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  const handleKeyboardPan = (direction: 'up' | 'down' | 'left' | 'right') => {
    if (zoom > 1) {
      const step = 1;
      setPan(prev => {
        switch (direction) {
          case 'up':
            return { ...prev, y: Math.max(-10, prev.y - step) };
          case 'down':
            return { ...prev, y: Math.min(10, prev.y + step) };
          case 'left':
            return { ...prev, x: Math.max(-10, prev.x - step) };
          case 'right':
            return { ...prev, x: Math.min(10, prev.x + step) };
          default:
            return prev;
        }
      });
    }
  };
  
  // Update playback rate when it changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate, videoRef.current]);
  
  // Reset zoom and pan when changing clips
  useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [clip]);
  
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return; // Ignore if user is typing in an input field
      }
      
      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowRight':
          if (e.shiftKey && zoom > 1) {
            e.preventDefault();
            handleKeyboardPan('right');
          } else if (videoRef.current) {
            e.preventDefault();
            videoRef.current.currentTime += 5; // Skip forward 5 seconds
          }
          break;
        case 'ArrowLeft':
          if (e.shiftKey && zoom > 1) {
            e.preventDefault();
            handleKeyboardPan('left');
          } else if (videoRef.current) {
            e.preventDefault();
            videoRef.current.currentTime -= 5; // Skip backward 5 seconds
          }
          break;
        case 'ArrowUp':
          if (zoom > 1) {
            e.preventDefault();
            handleKeyboardPan('up');
          }
          break;
        case 'ArrowDown':
          if (zoom > 1) {
            e.preventDefault();
            handleKeyboardPan('down');
          }
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case '+':
        case '=': // Same key as + but without shift
          e.preventDefault();
          handleZoomIn();
          break;
        case '-':
          e.preventDefault();
          handleZoomOut();
          break;
        case 'r':
          e.preventDefault();
          handleZoomReset();
          break;
        default:
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [zoom, isPlaying, isMuted]);
  
  // Format displayed current time
  const formattedCurrentTime = formatTime(currentTime);
  const formattedDuration = formatTime(videoRef.current?.duration || 300);
  
  // Display the clip time (time of day)
  const clipTimeDisplay = clip ? clip.startTime : "--:--";
  
  return (
    <div className="video-player-container bg-[#000000] rounded-lg shadow-lg overflow-hidden mb-4 border border-[#BCBBBB]">
      <div 
        ref={videoContainerRef}
        className="relative overflow-hidden" 
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ 
          cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
          height: "calc(100vh - 280px)",  /* Make the video larger */
          minHeight: "450px"
        }}
      >
        {/* Main video element with zoom and pan transform */}
        <div 
          className="video-transform-container w-full h-full transition-transform duration-100"
          style={{ 
            transform: `scale(${zoom}) translate(${pan.x}%, ${pan.y}%)`,
            transformOrigin: 'center',
          }}
        >
          <video 
            ref={videoRef}
            className="w-full h-full object-contain bg-[#555555]"
            src={clipUrl}
            onTimeUpdate={handleTimeUpdate}
            onEnded={onEnded}
          >
            Your browser does not support the video tag.
          </video>
        </div>
        
        {/* Preload next video (hidden) */}
        <video 
          ref={preloadVideoRef}
          className="hidden"
          preload="auto"
          muted
        />
        
        {/* Loading indicator */}
        {isLoadingUrl && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#000000] bg-opacity-70 z-10">
            <Loader2 className="h-12 w-12 text-[#FBBC05] animate-spin" />
          </div>
        )}
        
        {/* Video info overlay */}
        <div className="absolute top-4 left-4 bg-[#000000] bg-opacity-70 text-[#FFFFFF] px-3 py-1 rounded text-sm font-mono border border-[#FBBC05] z-10">
          <span>{clipTimeDisplay}</span>
        </div>
        
        {/* Zoom controls overlay */}
        <div className="absolute top-4 right-4 flex space-x-2 z-10">
          <button
            className="bg-[#000000] bg-opacity-70 text-[#FFFFFF] p-2 rounded-full hover:bg-[#FBBC05] hover:bg-opacity-30 transition-colors"
            onClick={handleZoomIn}
            disabled={zoom >= 3}
            title="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          
          <button
            className="bg-[#000000] bg-opacity-70 text-[#FFFFFF] p-2 rounded-full hover:bg-[#FBBC05] hover:bg-opacity-30 transition-colors"
            onClick={handleZoomOut}
            disabled={zoom <= 1}
            title="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          
          <button
            className="bg-[#000000] bg-opacity-70 text-[#FFFFFF] p-2 rounded-full hover:bg-[#FBBC05] hover:bg-opacity-30 transition-colors"
            onClick={handleZoomReset}
            disabled={zoom === 1 && pan.x === 0 && pan.y === 0}
            title="Reset Zoom & Pan"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>

        {/* Pan controls - only visible when zoomed in */}
        {zoom > 1 && (
          <div className="absolute top-1/2 transform -translate-y-1/2 left-4 flex flex-col space-y-2 z-10">
            <button
              className="bg-[#000000] bg-opacity-70 text-[#FFFFFF] p-2 rounded-full hover:bg-[#FBBC05] hover:bg-opacity-30 transition-colors"
              onClick={() => handleKeyboardPan('up')}
              title="Pan Up (↑)"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
            <button
              className="bg-[#000000] bg-opacity-70 text-[#FFFFFF] p-2 rounded-full hover:bg-[#FBBC05] hover:bg-opacity-30 transition-colors"
              onClick={() => handleKeyboardPan('left')}
              title="Pan Left (←)"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button
              className="bg-[#000000] bg-opacity-70 text-[#FFFFFF] p-2 rounded-full hover:bg-[#FBBC05] hover:bg-opacity-30 transition-colors"
              onClick={() => handleKeyboardPan('right')}
              title="Pan Right (→)"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              className="bg-[#000000] bg-opacity-70 text-[#FFFFFF] p-2 rounded-full hover:bg-[#FBBC05] hover:bg-opacity-30 transition-colors"
              onClick={() => handleKeyboardPan('down')}
              title="Pan Down (↓)"
            >
              <ArrowDown className="h-4 w-4" />
            </button>
          </div>
        )}
        
        {/* Video controls */}
        <div className="video-controls absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#000000] to-transparent p-4 flex items-center flex-wrap z-10">
          <div className="flex items-center w-full mb-2">
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
            
            {/* Playback rate control */}
            <Popover>
              <PopoverTrigger asChild>
                <button
                  className="text-[#FFFFFF] p-2 rounded-full hover:bg-[#FBBC05] hover:bg-opacity-20 flex items-center"
                  title="Playback Speed"
                >
                  <span className="mr-1 text-xs">{playbackRate}x</span>
                  {playbackRate > 1 ? (
                    <FastForward className="h-4 w-4" />
                  ) : playbackRate < 1 ? (
                    <Rewind className="h-4 w-4" />
                  ) : null}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2">
                <div className="space-y-2">
                  <div className="font-medium text-sm mb-2 text-[#555555]">Playback Speed</div>
                  {playbackRates.map((rate) => (
                    <Button
                      key={rate}
                      variant={rate === playbackRate ? "default" : "outline"}
                      size="sm"
                      className="w-full justify-between"
                      onClick={() => changePlaybackRate(rate)}
                    >
                      {rate}x
                      {rate === 1 && <span className="text-xs">(normal)</span>}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            
            <button 
              className="text-[#FFFFFF] p-2 rounded-full hover:bg-[#FBBC05] hover:bg-opacity-20 ml-1"
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
          
          {/* Zoom info */}
          {zoom > 1 && (
            <div className="w-full text-[#FFFFFF] text-xs font-mono">
              Zoom: {zoom.toFixed(2)}x | Pan: {pan.x.toFixed(1)}, {pan.y.toFixed(1)} | Drag video or use arrow keys (Shift+arrow) to pan
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
