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
  
  // State for video playback
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  
  // State for zoom and pan
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  // Fetch camera information when component mounts or selection changes
  useEffect(() => {
    async function fetchCameraInfo() {
      if (selectedCameras && selectedCameras.length > 0) {
        const cameraId = selectedCameras[0]; // Get the first selected camera
        
        try {
          // Fetch all devices to find the selected camera
          const response = await fetch('/api/devices');
          if (!response.ok) {
            throw new Error(`API request failed with status: ${response.status}`);
          }
          
          const devices = await response.json();
          
          // Find the selected camera - use both id and deviceId for compatibility 
          // (deviceId from API would match selectedCameras when using sidebar)
          console.log("Looking for camera with ID:", cameraId);
          console.log("Available devices:", devices);
          const selectedCamera = devices.find((device: any) => 
            device.id === cameraId || device.deviceId === cameraId
          );
          
          if (selectedCamera) {
            // Update local state with camera info
            const cameraData = {
              name: selectedCamera.name,
              location: selectedCamera.location,
              jobsiteName: selectedCamera.jobsiteName
            };
            
            setCameraInfo(cameraData);
            
            // Update global context for page title display
            setCameraName(selectedCamera.name);
            setJobsiteName(selectedCamera.jobsiteName);
            
            // Set the page title to "Camera Name at Jobsite Name"
            setPageTitle(`${selectedCamera.name} at ${selectedCamera.jobsiteName}`);
            
            // Save camera info to session storage for persistence
            sessionStorage.setItem('currentCameraInfo', JSON.stringify(cameraData));
            
            // For debug
            console.log(`Loaded camera: ${selectedCamera.name} at ${selectedCamera.jobsiteName}`);
          } else {
            console.warn(`No camera found with ID: ${cameraId}`);
          }
        } catch (error) {
          console.error("Error fetching camera information:", error);
        }
      }
    }
    
    // First try to load from session storage if available
    try {
      const savedCameraInfo = sessionStorage.getItem('currentCameraInfo');
      if (savedCameraInfo && selectedCameras.length > 0) {
        const parsedInfo = JSON.parse(savedCameraInfo);
        setCameraInfo(parsedInfo);
        setCameraName(parsedInfo.name);
        setJobsiteName(parsedInfo.jobsiteName);
        setPageTitle(`${parsedInfo.name} at ${parsedInfo.jobsiteName}`);
        console.log(`Restored camera from session: ${parsedInfo.name} at ${parsedInfo.jobsiteName}`);
      }
    } catch (e) {
      console.error("Error loading camera info from session storage:", e);
    }
    
    // Then fetch the latest info from API
    fetchCameraInfo();
  }, [selectedCameras, setCameraName, setJobsiteName, setPageTitle]);
  
  // Toggle play/pause
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
  
  // Zoom controls
  const zoomIn = () => {
    if (zoom < 4) { // Maximum zoom level
      setZoom(prev => Math.min(prev + 0.25, 4));
    }
  };
  
  const zoomOut = () => {
    if (zoom > 1) { // Minimum zoom level
      setZoom(prev => Math.max(prev - 0.25, 1));
      
      // Reset pan if we're back to zoom level 1
      if (zoom <= 1.25) {
        setPan({ x: 0, y: 0 });
      }
    }
  };
  
  // Pan controls
  const panUp = () => {
    if (zoom > 1) {
      setPan(prev => ({ ...prev, y: Math.max(prev.y - 5, -20) }));
    }
  };
  
  const panDown = () => {
    if (zoom > 1) {
      setPan(prev => ({ ...prev, y: Math.min(prev.y + 5, 20) }));
    }
  };
  
  const panLeft = () => {
    if (zoom > 1) {
      setPan(prev => ({ ...prev, x: Math.max(prev.x - 5, -20) }));
    }
  };
  
  const panRight = () => {
    if (zoom > 1) {
      setPan(prev => ({ ...prev, x: Math.min(prev.x + 5, 20) }));
    }
  };
  
  // Reset zoom and pan
  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };
  
  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (videoContainerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoContainerRef.current.requestFullscreen();
      }
    }
  };
  
  // Mouse down handler for pan dragging
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX,
        y: e.clientY
      });
    }
  };
  
  // Mouse move handler for pan dragging
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging && zoom > 1) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      
      // Calculate new pan values with limits
      const newX = pan.x + dx * 0.05;
      const newY = pan.y + dy * 0.05;
      
      setPan({
        x: Math.max(-20, Math.min(20, newX)),
        y: Math.max(-20, Math.min(20, newY))
      });
      
      setDragStart({
        x: e.clientX,
        y: e.clientY
      });
    }
  };
  
  // Mouse up handler to end pan dragging
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  // Handle keyboard controls
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
          panUp();
          break;
        case 'ArrowDown':
          panDown();
          break;
        case 'ArrowLeft':
          panLeft();
          break;
        case 'ArrowRight':
          panRight();
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
  
  // Clean up dragging state if mouse leaves the component
  useEffect(() => {
    const handleMouseLeave = () => {
      setIsDragging(false);
    };
    
    const videoContainer = videoContainerRef.current;
    if (videoContainer) {
      videoContainer.addEventListener('mouseleave', handleMouseLeave);
      
      return () => {
        videoContainer.removeEventListener('mouseleave', handleMouseLeave);
      };
    }
  }, []);
  
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
        <div 
          ref={videoContainerRef}
          className="relative bg-[#000000] rounded-lg overflow-hidden"
          style={{
            height: "calc(100vh - 280px)",
            minHeight: "450px"
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Video with zoom and pan transform */}
          <div 
            className="video-transform-container w-full h-full transition-transform duration-100 cursor-move"
            style={{ 
              transform: `scale(${zoom}) translate(${pan.x}%, ${pan.y}%)`,
              transformOrigin: 'center',
            }}
          >
            <video 
              ref={videoRef}
              className="w-full h-full object-contain"
              src={mockStreamUrl}
              loop
              muted={isMuted}
              playsInline
              onClick={togglePlayPause}
            >
              Your browser does not support the video tag.
            </video>
          </div>
          
          {/* Info Overlay */}
          <div className="absolute top-4 left-4 bg-[#000000] bg-opacity-70 text-[#FFFFFF] px-3 py-1 rounded text-sm font-mono border border-[#FBBC05] z-10">
            <span>LIVE</span>
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
                  onClick={panUp}
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
              </div>
              <div className="col-start-1 row-start-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="bg-[#000000] bg-opacity-70 border-[#FBBC05] text-[#FFFFFF] hover:bg-[#FBBC05] hover:text-[#000000] p-1"
                  onClick={panLeft}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </div>
              <div className="col-start-3 row-start-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="bg-[#000000] bg-opacity-70 border-[#FBBC05] text-[#FFFFFF] hover:bg-[#FBBC05] hover:text-[#000000] p-1"
                  onClick={panRight}
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="col-start-2 row-start-3">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="bg-[#000000] bg-opacity-70 border-[#FBBC05] text-[#FFFFFF] hover:bg-[#FBBC05] hover:text-[#000000] p-1"
                  onClick={panDown}
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
          
          {/* Video controls */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
            <div className="flex items-center gap-2 bg-[#000000] bg-opacity-70 rounded-full px-4 py-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-[#FFFFFF] hover:bg-[#FBBC05] hover:text-[#000000] rounded-full"
                onClick={togglePlayPause}
              >
                {isPlaying ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                    <rect x="6" y="4" width="4" height="16"></rect>
                    <rect x="14" y="4" width="4" height="16"></rect>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                )}
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-[#FFFFFF] hover:bg-[#FBBC05] hover:text-[#000000] rounded-full"
                onClick={toggleMute}
              >
                {isMuted ? <Volume className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-[#FFFFFF] hover:bg-[#FBBC05] hover:text-[#000000] rounded-full"
                onClick={toggleFullscreen}
              >
                <Maximize className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          {/* Zoom info */}
          {zoom > 1 && (
            <div className="absolute bottom-14 left-0 right-0 flex justify-center">
              <div className="bg-[#000000] bg-opacity-70 text-[#FFFFFF] px-3 py-1 rounded text-xs font-mono z-10">
                Zoom: {zoom.toFixed(1)}x | Pan: {pan.x.toFixed(1)}, {pan.y.toFixed(1)} | Drag video to pan
              </div>
            </div>
          )}
        </div>
        
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