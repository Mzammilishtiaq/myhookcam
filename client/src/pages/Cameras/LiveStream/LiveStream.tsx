import { useState, useRef, useEffect, useContext } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ZoomIn, 
  ZoomOut, 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight, 
  RotateCcw, 
  Maximize,
  Volume,
  Volume2
} from "lucide-react";
import { usePageTitle, SelectionContext } from "@/context/SelectionContext";
import VideoJsZoomPlayer from "@/components/ui/Videojs";

export default function LiveStream() {
  // Mock video stream URL - in production this would be replaced with a real stream URL
  const mockStreamUrl = "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
  
  // Access contexts
  const { selectedCameras } = useContext(SelectionContext);
  const { setPageTitle, setCameraName, setJobsiteName } = usePageTitle();
  
  // Camera state
  const [cameraInfo, setCameraInfo] = useState<{
    name: string;
    location: string;
    jobsiteName: string;
  } | null>(null);
  
  return (
    <div className="container mx-auto p-4">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4 text-[#555555]">
          {cameraInfo?.name ? (
            <>
              {cameraInfo.name}
              {cameraInfo.jobsiteName && (
                <span className="text-base ml-2 text-[#555555] opacity-75">
                  at {cameraInfo.jobsiteName}
                </span>
              )}
            </>
          ) : (
            <>
              <span className="text-[#FBBC05]">HookCam</span> Live Stream
            </>
          )}
        </h2>
        
        {/* Video Container */}
               <VideoJsZoomPlayer src={'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8'} />
       
        
        <div className="mt-4 p-4 bg-[#FBBC05]/10 rounded-lg border border-[#FBBC05]">
          <h3 className="font-semibold mb-2">Pan & Zoom Controls:</h3>
          <ul className="text-[#555555] list-disc pl-6 mb-2">
            <li>Click and drag to pan (when zoomed in)</li>
            <li>Use + and - keys to zoom in/out</li>
            <li>Use arrow keys to pan</li>
            <li>Press 'r' to reset view</li>
            <li>Press 'f' for fullscreen</li>
            <li>Press 'm' to toggle mute</li>
            <li>Press spacebar to play/pause</li>
          </ul>
          <p className="text-sm italic">Note: This is a demo of the pan/zoom functionality using a sample video. In production, this would be connected to your live camera stream.</p>
        </div>
      </Card>
    </div>
  );
}