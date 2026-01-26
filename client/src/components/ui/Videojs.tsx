import { useEffect, useRef, useState } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import { Button } from "@/components/ui/button";
import {
  ZoomIn,
  ZoomOut,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  RotateCcw
} from "lucide-react";

interface VideoJsZoomPlayerProps {
  src: string;
  type?: string;
}

export default function VideoJsZoomPlayer({
  src,
  type = "application/x-mpegURL"
}: VideoJsZoomPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const techVideoRef = useRef<HTMLVideoElement | null>(null);

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    if (!playerRef.current && videoRef.current) {
      playerRef.current = videojs(videoRef.current, {
        controls: true,
        autoplay: false,
        preload: "auto",
        fluid: true,
        liveui: true,
        muted: true
      });

      playerRef.current.ready(() => {
        techVideoRef.current =
          playerRef.current.el().querySelector("video");
      });
    }

    if (src && playerRef.current) {
      playerRef.current.src({ src, type });
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [src, type]);

  useEffect(() => {
    if (!techVideoRef.current) return;

    techVideoRef.current.style.transform = `scale(${zoom}) translate(${pan.x}%, ${pan.y}%)`;
    techVideoRef.current.style.transformOrigin = "center";
    techVideoRef.current.style.transition = "transform 0.1s linear";
  }, [zoom, pan]);

  const zoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 4));
    sendCameraZoom("in");
  };

  const zoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 1));
    if (zoom <= 1.25) setPan({ x: 0, y: 0 });
    sendCameraZoom("out");
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const panMove = (dx: number, dy: number) => {
    if (zoom <= 1) return;
    setPan(prev => ({
      x: Math.max(-20, Math.min(20, prev.x + dx)),
      y: Math.max(-20, Math.min(20, prev.y + dy))
    }));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoom <= 1) return;

    const dx = (e.clientX - dragStart.x) * 0.05;
    const dy = (e.clientY - dragStart.y) * 0.05;

    panMove(dx, dy);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => setIsDragging(false);

  const sendCameraZoom = async (direction: "in" | "out") => {
    try {
      await fetch("/api/camera/zoom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ direction })
      });
    } catch (e) {
      console.error("Camera zoom failed", e);
    }
  };
    // Fullscreen toggle
  const toggleFullscreen = () => {
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        containerRef.current.requestFullscreen();
      }
    }
  };
  
  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(err => {
          console.error("Error playing video:", err);
        });
      }
      setIsPlaying(!isPlaying);
    }
  };
    // Toggle mute
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        switch (e.key) {
          case '+':
            zoomIn();
            break;
          case '-':
            zoomOut();
            break;
          case 'ArrowUp':
            panMove(0, -5);
            break;
          case 'ArrowDown':
            panMove(0, 5);
            break;
          case 'ArrowLeft':
            panMove(-5, 0);
            break;
          case 'ArrowRight':
            panMove(5, 0);
            break;
          case 'r':
            resetView();
            break;
          case ' ':
            togglePlayPause();
            break;
          case 'f':
            toggleFullscreen();
            break;
          case 'm':
            toggleMute();
            break;
          default:
            break;
        }
      };
      
      window.addEventListener('keydown', handleKeyDown);
      
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }, [zoom, pan, isPlaying, isMuted]);
  return (
    <div
      ref={containerRef}
      className={`relative bg-black rounded-lg overflow-hidden ${zoom > 1 ? "cursor-move active:cursor-grab" : "cursor-pointer"}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div data-vjs-player>
        <video
          ref={videoRef}
          className={`video-js vjs-big-play-centered`}
        />
      </div>

      {/* Zoom controls overlay */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
        <Button
          size="sm"
          variant="outline"
          className="bg-[#000000] bg-opacity-70 border-[#FBBC05] text-[#FFFFFF] hover:bg-[#FBBC05] hover:text-[#000000]"
          onClick={zoomIn}
          disabled={zoom >= 4}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="bg-[#000000] bg-opacity-70 border-[#FBBC05] text-[#FFFFFF] hover:bg-[#FBBC05] hover:text-[#000000]"
          onClick={zoomOut}
          disabled={zoom <= 1}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="bg-[#000000] bg-opacity-70 border-[#FBBC05] text-[#FFFFFF] hover:bg-[#FBBC05] hover:text-[#000000]"
          onClick={resetView}
          disabled={zoom === 1 && pan.x === 0 && pan.y === 0}
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {/* Pan controls overlay - Only visible when zoomed in */}
      {zoom > 1 && (
        <div className="absolute bottom-20 right-4 grid grid-cols-3 gap-1 z-10">
          <div className="col-start-2">
            <Button
              size="sm"
              variant="outline"
              className="bg-[#000000] bg-opacity-70 border-[#FBBC05] text-[#FFFFFF] hover:bg-[#FBBC05] hover:text-[#000000] p-1"
              onClick={() => panMove(0, -5)}><ArrowUp />
            </Button>
          </div>
          <div className="col-start-1 row-start-2">
            <Button
              size="sm"
              variant="outline"
              className="bg-[#000000] bg-opacity-70 border-[#FBBC05] text-[#FFFFFF] hover:bg-[#FBBC05] hover:text-[#000000] p-1"
              onClick={() => panMove(-5, 0)}><ArrowLeft />
            </Button>
          </div>
          <div className="col-start-3 row-start-2">
            <Button
              size="sm"
              variant="outline"
              className="bg-[#000000] bg-opacity-70 border-[#FBBC05] text-[#FFFFFF] hover:bg-[#FBBC05] hover:text-[#000000] p-1"
              onClick={() => panMove(5, 0)}><ArrowRight />
            </Button>
          </div>
          <div className="col-start-2 row-start-3">
            <Button
              size="sm"
              variant="outline"
              className="bg-[#000000] bg-opacity-70 border-[#FBBC05] text-[#FFFFFF] hover:bg-[#FBBC05] hover:text-[#000000] p-1"
              onClick={() => panMove(0, 5)}><ArrowDown />
            </Button>
          </div>
        </div>

      )}

      {zoom > 1 && (
        <div className="absolute bottom-4 left-0 right-0 text-center text-white text-xs">
          Zoom {zoom.toFixed(1)}x , drag video to move
        </div>
      )}
    </div>
  );
}
