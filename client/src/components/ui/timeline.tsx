import { useRef, useEffect, useState } from "react";
import { 
  AlertTriangle, Loader2, ZoomIn, ZoomOut, Bookmark, MessageSquare,
  FileDown, BookmarkPlus, FileEdit, Share2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { VideoPreview } from "@/components/ui/video-preview";
import type { Clip, Annotation, Bookmark as BookmarkType } from "@shared/schema";
import { useBookmarks } from "@/hooks/use-bookmarks";
import { useAnnotations } from "@/hooks/use-annotations";
import { useToast } from "@/hooks/use-toast";
import { formatVideoTime } from "@/lib/time";
import { ShareModal } from "@/components/ui/share-modal";

interface TimelineProps {
  clips: Clip[];
  currentClip?: Clip;
  isLoading: boolean;
  isError: boolean;
  onSelectClip: (clip: Clip) => void;
  onExportCurrentClip: () => void;
  selectedDate: string;
}

// Smart zoom level presets
type ZoomPreset = {
  id: string;
  label: string;
  level: number;
  focus: number | null; // null means no specific focus
  description: string;
};

const ZOOM_PRESETS: ZoomPreset[] = [
  { 
    id: 'full-day', 
    label: 'Full Day',
    level: 1,
    focus: null,
    description: 'View the entire 24-hour timeline'
  },
  { 
    id: 'working-hours', 
    label: 'Working Hours',
    level: 2,
    focus: 12, // Noon as focus point
    description: 'Focus on 7am-5pm working hours'
  },
  { 
    id: 'morning', 
    label: 'Morning',
    level: 3,
    focus: 9, // 9am
    description: 'Focus on morning hours (7am-12pm)'
  },
  { 
    id: 'afternoon', 
    label: 'Afternoon',
    level: 3,
    focus: 14, // 2pm
    description: 'Focus on afternoon hours (12pm-5pm)'
  },
  { 
    id: 'detail', 
    label: 'Detailed View',
    level: 4,
    focus: null, // Will use current focus or default to 9am
    description: 'Maximum detail for precise navigation'
  }
];

export function Timeline({
  clips,
  currentClip,
  isLoading,
  isError,
  onSelectClip,
  onExportCurrentClip,
  selectedDate
}: TimelineProps) {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1); // Default zoom level
  const [focusHour, setFocusHour] = useState<number>(9); // Default focus on 9 AM
  const [activePreset, setActivePreset] = useState<string>('full-day'); // Default preset
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null); // Track hovered segment by time key
  const [previewPosition, setPreviewPosition] = useState<number>(50); // Position within clip (as percentage)
  const [mousePosition, setMousePosition] = useState<{x: number, y: number}>({x: 0, y: 0}); // Track mouse position for preview
  const [exportFormat, setExportFormat] = useState<string>("mp4");
  const [exportQuality, setExportQuality] = useState<string>("high");
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const { toast } = useToast();
  
  // Fetch bookmarks and annotations for the selected date
  const { bookmarks = [], addBookmark } = useBookmarks(selectedDate);
  const { data: annotations = [], createAnnotation } = useAnnotations(selectedDate);
  
  // Generate segments for a 24-hour timeline with emphasis on working hours (7am-5pm)
  // Each segment represents a 5-minute interval (288 segments in a day)
  const hourMarkers = Array.from({ length: 24 }, (_, i) => {
    const hour = i;
    const amPm = hour < 12 ? 'AM' : 'PM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const label = `${displayHour} ${amPm}`;
    const isWorkingHour = hour >= 7 && hour <= 17; // 7am to 5pm
    
    return {
      hour,
      label,
      position: (hour / 24) * 100,
      isWorkingHour
    };
  });
  
  // Helper function to find annotations and bookmarks for a segment
  const findItemsForSegment = (clipTime: string) => {
    // Find annotations for this segment
    const segmentAnnotations = annotations.filter((anno: Annotation) => {
      // Check if the annotation clipTime matches the segment
      return anno.clipTime === clipTime;
    });
    
    // Find bookmarks for this segment
    const segmentBookmarks = bookmarks.filter((bookmark: BookmarkType) => {
      // Check if the bookmark clipTime matches the segment
      return bookmark.clipTime === clipTime; 
    });
    
    return {
      annotations: segmentAnnotations,
      bookmarks: segmentBookmarks,
      hasAnnotations: segmentAnnotations.length > 0,
      hasBookmarks: segmentBookmarks.length > 0
    };
  };
  
  // Find clip by clipTime for jumping to a specific time
  const findClipByTime = (clipTime: string): Clip | undefined => {
    return clips.find(clip => clip.startTime === clipTime);
  };
  
  // Generate time segments map for the entire day
  const generateTimeSegments = () => {
    // Create a map to track which 5-minute segments have clips
    const segmentMap = new Map<string, Clip>();
    
    // Populate map with available clips
    clips.forEach(clip => {
      // Extract hour and minute from clip start time (format: HH:MM)
      const [hours, minutes] = clip.startTime.split(':').map(Number);
      
      // Calculate segment key (HH:MM format)
      const segmentKey = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      
      // Store clip in the map
      segmentMap.set(segmentKey, clip);
    });
    
    // Generate all 288 5-minute segments for a 24-hour day
    const segments = [];
    
    for (let hour = 0; hour < 24; hour++) {
      const isWorkingHour = hour >= 7 && hour <= 17; // 7am to 5pm
      
      for (let minute = 0; minute < 60; minute += 5) {
        const timeKey = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const displayTime = formatTimeDisplay(hour, minute);
        
        // Find annotations and bookmarks for this segment
        const { hasAnnotations, hasBookmarks, annotations: segmentAnnotations, bookmarks: segmentBookmarks } = findItemsForSegment(timeKey);
        
        segments.push({
          time: timeKey,
          displayTime,
          hasClip: segmentMap.has(timeKey),
          clip: segmentMap.get(timeKey),
          isCurrent: currentClip && currentClip.startTime === timeKey,
          isWorkingHour,
          hasAnnotations,
          hasBookmarks,
          annotations: segmentAnnotations,
          bookmarks: segmentBookmarks
        });
      }
    }
    
    return segments;
  };
  
  // Format time for display
  const formatTimeDisplay = (hour: number, minute: number) => {
    const amPm = hour < 12 ? 'AM' : 'PM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minute.toString().padStart(2, '0')} ${amPm}`;
  };
  
  // Generate all timeline segments
  const timeSegments = generateTimeSegments();
  
  // Scroll to current clip when it changes
  useEffect(() => {
    if (currentClip && timelineRef.current) {
      // Find the segment index for the current clip
      const segmentIndex = timeSegments.findIndex(
        segment => segment.time === currentClip.startTime
      );
      
      if (segmentIndex !== -1) {
        // Calculate position to scroll to
        const segmentWidth = timelineRef.current.scrollWidth / timeSegments.length;
        const scrollPosition = segmentIndex * segmentWidth - timelineRef.current.clientWidth / 2;
        
        timelineRef.current.scrollTo({
          left: scrollPosition,
          behavior: 'smooth'
        });
      }
    }
  }, [currentClip]);
  
  // Calculate width for each segment - adjust based on zoom level
  const baseSegmentWidth = 0.5; // Base percentage width (increased from 0.35)
  const segmentWidth = baseSegmentWidth * zoomLevel;
  
  // Filter segments based on focus hour and zoom level
  const getVisibleSegments = () => {
    // For zoom level 1, show all segments
    if (zoomLevel <= 1) {
      return timeSegments;
    }
    
    // For higher zoom levels, focus on segments around the focus hour
    // The range narrows as zoom level increases
    const rangeSize = Math.max(4, 24 / zoomLevel);
    const startHour = Math.max(0, focusHour - rangeSize / 2);
    const endHour = Math.min(24, focusHour + rangeSize / 2);
    
    return timeSegments.filter(segment => {
      const [hours] = segment.time.split(':').map(Number);
      return hours >= startHour && hours < endHour;
    });
  };
  
  const visibleSegments = getVisibleSegments();
  
  // Handle zoom in/out
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.5, 4)); // Max zoom level is 4x
  };
  
  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.5, 1)); // Min zoom level is 1x
    if (zoomLevel <= 1.5) {
      // When zooming out to near default, reset to full day preset
      setActivePreset('full-day');
    } else {
      // Otherwise, indicate custom zoom
      setActivePreset('custom');
    }
  };
  
  // Handle focus hour change
  const handleFocusChange = (value: number[]) => {
    setFocusHour(value[0]);
  };
  
  return (
    <div className="timeline-container mt-4">
      <div className="flex items-center mb-1">
        <h2 className="text-lg font-medium text-[#555555]">Timeline - Working Hours (7am-5pm)</h2>
        
        <div className="ml-auto flex flex-wrap gap-2 text-xs">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-[#FBBC05] rounded-full mr-1"></div>
            <span className="text-[#555555]">Available</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-[#ff9900] rounded-full mr-1"></div>
            <span className="text-[#555555]">Bookmarks</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-[#ffa833] rounded-full mr-1"></div>
            <span className="text-[#555555]">Notes</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-gradient-to-tr from-[#FBBC05] to-[#ff9900] rounded-full mr-1"></div>
            <span className="text-[#555555]">Both</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-[#555555] rounded-full mr-1"></div>
            <span className="text-[#555555]">No Footage</span>
          </div>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-24 bg-[#FFFFFF] rounded-lg shadow border border-[#BCBBBB]">
          <Loader2 className="h-8 w-8 text-[#FBBC05] animate-spin" />
          <span className="ml-2 text-[#555555]">Loading clips...</span>
        </div>
      ) : isError ? (
        <div className="flex items-center justify-center h-24 bg-[#FFFFFF] rounded-lg shadow border border-[#BCBBBB]">
          <AlertTriangle className="h-8 w-8 text-[#555555]" />
          <span className="ml-2 text-[#555555]">Error loading timeline data</span>
        </div>
      ) : (
        <div className="timeline-scroll-container overflow-x-scroll bg-[#FFFFFF] rounded-lg shadow border border-[#BCBBBB] h-[80px] flex-1 relative" style={{
          scrollbarWidth: 'auto',
          scrollbarColor: '#BCBBBB #FFFFFF',
          overflowY: 'hidden',
          paddingBottom: '6px',
          paddingTop: '2px'
        }}>
          <div 
            ref={timelineRef}
            className="timeline-wrapper relative p-1"
            style={{ width: "150%" }}
          >
            {/* Hour markers - filter based on zoom level */}
            <div className="hour-markers relative h-5">
              {hourMarkers
                .filter(marker => {
                  if (zoomLevel <= 1) return true;
                  const rangeSize = Math.max(4, 24 / zoomLevel);
                  const startHour = Math.max(0, focusHour - rangeSize / 2);
                  const endHour = Math.min(24, focusHour + rangeSize / 2);
                  return marker.hour >= startHour && marker.hour < endHour;
                })
                .map((marker) => (
                  <div 
                    key={marker.hour}
                    className={`hour-marker absolute border-l ${
                      marker.isWorkingHour ? 'border-[#555555] border-l-2' : 'border-[#BCBBBB]'
                    }`}
                    style={{ 
                      left: zoomLevel <= 1 
                        ? `${marker.position}%` 
                        : `${(marker.hour - Math.max(0, focusHour - Math.max(4, 24 / zoomLevel) / 2)) / Math.min(24, Math.max(4, 24 / zoomLevel)) * 100}%` 
                    }}
                    data-hour={marker.label}
                  >
                    <div className={`absolute top-4 transform -translate-x-1/2 text-xs font-mono ${
                      marker.isWorkingHour ? 'text-[#555555] font-bold' : 'text-[#BCBBBB]'
                    }`}>
                      {marker.label}
                    </div>
                  </div>
                ))}
            </div>
            
            {/* Timeline segments */}
            <div className="timeline-segments flex h-5 mt-5">
              {visibleSegments.map((segment, index) => (
                <div
                  key={index}
                  className={`timeline-segment hover:opacity-80 transition-opacity relative group
                    ${segment.hasClip 
                      ? segment.hasBookmarks && segment.hasAnnotations 
                        ? 'bg-gradient-to-tr from-[#FBBC05] to-[#ff9900] border border-[#000000]/20' 
                        : segment.hasBookmarks 
                          ? 'bg-[#ff9900] border border-[#000000]/20'
                          : segment.hasAnnotations
                            ? 'bg-[#ffa833] border border-[#000000]/20'
                            : 'bg-[#FBBC05] border border-[#000000]/20'
                      : 'bg-[#555555]'
                    } ${
                      segment.isCurrent ? 'ring-2 ring-[#000000]' : ''
                    } ${
                      segment.isWorkingHour ? 'h-5' : 'h-4 mt-1'
                    }`}
                  style={{ width: `${segmentWidth}%` }}
                  title={segment.displayTime}
                  onClick={() => segment.hasClip && segment.clip && onSelectClip(segment.clip)}
                  onMouseEnter={(e) => {
                    // Always set hovered segment for feedback, regardless of clip presence
                    setHoveredSegment(segment.time);
                    console.log("Hovering segment:", segment.time, "Has clip:", segment.hasClip, "Clip:", segment.clip);
                    
                    // Calculate relative position in segment (0-100%)
                    const rect = e.currentTarget.getBoundingClientRect();
                    const relativeX = e.clientX - rect.left;
                    const percentage = (relativeX / rect.width) * 100;
                    setPreviewPosition(percentage);
                    
                    // Update mouse position for preview positioning
                    setMousePosition({
                      x: e.clientX,
                      y: e.clientY
                    });
                  }}
                  onMouseMove={(e) => {
                    if (hoveredSegment === segment.time) {
                      // Update position on mouse move
                      const rect = e.currentTarget.getBoundingClientRect();
                      const relativeX = e.clientX - rect.left;
                      const percentage = (relativeX / rect.width) * 100;
                      setPreviewPosition(percentage);
                      
                      // Update mouse position for preview positioning
                      setMousePosition({
                        x: e.clientX,
                        y: e.clientY
                      });
                    }
                  }}
                  onMouseLeave={() => {
                    setHoveredSegment(null);
                  }}
                >
                  {segment.isCurrent && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 bg-[#000000] text-[#FFFFFF] px-2 py-1 rounded text-xs font-mono whitespace-nowrap">
                      Now Playing
                    </div>
                  )}
                  {zoomLevel >= 2.5 && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 text-[#555555] text-[10px] font-mono whitespace-nowrap">
                      {segment.time.split(':')[1] === '00' ? segment.displayTime : segment.time.split(':')[1]}
                    </div>
                  )}
                  
                  {/* Info tooltip */}
                  {(segment.hasBookmarks || segment.hasAnnotations) && (
                    <div className="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 bg-[#000000] text-[#FFFFFF] px-3 py-2 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-lg max-w-[300px]">
                      <div className="font-bold text-center mb-1 pb-1 border-b border-gray-700">
                        {segment.displayTime} - Details
                      </div>
                      <div className="flex flex-col gap-2">
                        {segment.hasBookmarks && segment.bookmarks && segment.bookmarks.length > 0 && (
                          <div>
                            <div className="flex items-center mb-1">
                              <Bookmark className="h-3 w-3 mr-1 text-[#FBBC05] fill-[#FBBC05]" />
                              <span className="font-semibold">
                                {segment.bookmarks.length > 1 
                                  ? `${segment.bookmarks.length} Bookmarks` 
                                  : 'Bookmark'}
                              </span>
                            </div>
                            <ul className="list-disc list-inside pl-2">
                              {segment.bookmarks.map((bookmark: BookmarkType, i: number) => (
                                <li key={i} className="cursor-pointer hover:text-[#FBBC05] truncate" onClick={(e) => {
                                  e.stopPropagation();
                                  const clip = findClipByTime(segment.time);
                                  if (clip) onSelectClip(clip);
                                }}>
                                  {bookmark.label || 'Untitled bookmark'}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {segment.hasAnnotations && segment.annotations && segment.annotations.length > 0 && (
                          <div>
                            <div className="flex items-center mb-1">
                              <MessageSquare className="h-3 w-3 mr-1 text-[#FBBC05] fill-[#FBBC05]" />
                              <span className="font-semibold">
                                {segment.annotations.length > 1 
                                  ? `${segment.annotations.length} Annotations` 
                                  : 'Annotation'}
                              </span>
                            </div>
                            <ul className="list-disc list-inside pl-2">
                              {segment.annotations.map((annotation: Annotation, i: number) => (
                                <li key={i} className="cursor-pointer hover:text-[#FBBC05] truncate" onClick={(e) => {
                                  e.stopPropagation();
                                  const clip = findClipByTime(segment.time);
                                  if (clip) onSelectClip(clip);
                                }}>
                                  {annotation.content?.substring(0, 30) + (annotation.content?.length > 30 ? '...' : '') || 'No content'}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Count indicators */}
                  {(segment.hasBookmarks || segment.hasAnnotations) && (
                    <div className="absolute top-0 right-0 flex gap-1 p-0.5">
                      {segment.bookmarks && segment.bookmarks.length > 0 && (
                        <div className="flex items-center">
                          <Bookmark className="h-2.5 w-2.5 text-[#000000] fill-[#000000]" />
                          <span className="text-[9px] font-bold text-[#000000] bg-white/90 px-0.5 rounded">
                            {segment.bookmarks.length}
                          </span>
                        </div>
                      )}
                      {segment.annotations && segment.annotations.length > 0 && (
                        <div className="flex items-center">
                          <MessageSquare className="h-2.5 w-2.5 text-[#000000] fill-[#000000]" />
                          <span className="text-[9px] font-bold text-[#000000] bg-white/90 px-0.5 rounded">
                            {segment.annotations.length}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Video Preview */}
          <div 
            className={`fixed transform -translate-x-1/2 z-[100] transition-all duration-200 ${
              hoveredSegment ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            style={{ 
              left: hoveredSegment ? `${
                timelineRef.current ? 
                mousePosition.x : window.innerWidth / 2}px` : '50%',
              top: hoveredSegment ? `${
                timelineRef.current ? 
                mousePosition.y - 150 : window.innerHeight / 2}px` : '50%'
            }}
          >
            {hoveredSegment && (
              <>
                {visibleSegments.find(s => s.time === hoveredSegment && s.hasClip && s.clip) ? (
                  <div className="relative">
                    <VideoPreview 
                      clip={visibleSegments.find(s => s.time === hoveredSegment && s.hasClip)?.clip!}
                      position={previewPosition}
                      onPositionChange={setPreviewPosition}
                    />
                    <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-black mx-auto mt-[-1px]"></div>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="bg-black rounded-md shadow-lg flex items-center justify-center text-white p-3 border-2 border-[#FBBC05]" style={{ width: '240px', height: '135px' }}>
                      <span className="text-[#FBBC05]">No footage available for {hoveredSegment}</span>
                    </div>
                    <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-black mx-auto mt-[-1px]"></div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 bg-[#FFFFFF] p-3 rounded-lg shadow border border-[#BCBBBB] mt-2">
        <h2 className="text-md font-semibold text-[#555555] col-span-full mb-1">Timeline and Clip Controls</h2>
        <div className="timeline-controls">
          <h3 className="text-sm font-medium mb-1 text-[#555555]">Timeline Controls</h3>
          {/* Smart Zoom Presets */}
          <div className="zoom-presets flex flex-wrap items-center gap-1 mb-1">
            {ZOOM_PRESETS.map(preset => (
              <Button
                key={preset.id}
                variant={activePreset === preset.id ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setActivePreset(preset.id);
                  setZoomLevel(preset.level);
                  if (preset.focus !== null) {
                    setFocusHour(preset.focus);
                  }
                }}
                className={`
                  ${activePreset === preset.id 
                    ? 'bg-[#FBBC05] text-[#000000] hover:bg-[#FBBC05]/90' 
                    : 'text-[#555555] border-[#BCBBBB] hover:bg-[#FBBC05]/10'
                  }
                `}
                title={preset.description}
              >
                <span>{preset.label}</span>
              </Button>
            ))}
          </div>
          
          {/* Zoom Controls */}
          <div className="zoom-controls flex items-center gap-1 mb-1">
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomOut}
              disabled={zoomLevel <= 1}
              className="text-[#555555] border-[#BCBBBB] hover:bg-[#FBBC05]/10"
            >
              <ZoomOut className="h-4 w-4 mr-1" />
              <span>Zoom Out</span>
            </Button>
            
            <div className="flex-1 px-4">
              <Slider
                defaultValue={[focusHour]}
                max={23}
                step={1}
                value={[focusHour]}
                onValueChange={(value) => {
                  setFocusHour(value[0]);
                  // Reset active preset when manually adjusting
                  setActivePreset('custom');
                }}
                disabled={zoomLevel <= 1}
                className="w-full"
              />
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                handleZoomIn();
                // Reset active preset when manually zooming
                setActivePreset('custom');
              }}
              disabled={zoomLevel >= 4}
              className="text-[#555555] border-[#BCBBBB] hover:bg-[#FBBC05]/10"
            >
              <ZoomIn className="h-4 w-4 mr-1" />
              <span>Zoom In</span>
            </Button>
            
            <div className="text-sm text-[#555555]">
              {zoomLevel > 1 ? (
                <span>
                  {activePreset === 'custom' && <span className="text-xs bg-[#FBBC05]/20 px-1 py-0.5 rounded mr-1">Custom</span>}
                  Focus: {focusHour > 12 ? focusHour - 12 : focusHour}{focusHour >= 12 ? 'PM' : 'AM'} | {zoomLevel.toFixed(1)}x
                </span>
              ) : (
                <span>Full Day View</span>
              )}
            </div>
          </div>
        </div>
        
        <div className="clip-controls">
          <h3 className="text-sm font-medium mb-1 text-[#555555]">Clip Controls</h3>
          <div className="flex flex-wrap gap-1">
            <Button
              variant="default"
              className="bg-[#FBBC05] hover:bg-[#FBBC05]/90 text-[#000000]"
              onClick={onExportCurrentClip}
              disabled={!currentClip}
            >
              <FileDown className="mr-1 h-4 w-4" />
              <span>Export Current</span>
            </Button>
            
            <Button
              variant="outline"
              className="border-[#555555] text-[#555555] hover:bg-[#FBBC05]/10"
              onClick={() => {
                if (!currentClip) {
                  toast({
                    title: "No clip selected",
                    description: "Please select a clip to bookmark",
                    variant: "destructive"
                  });
                  return;
                }
                
                const label = prompt("Enter a label for this bookmark:");
                
                if (label) {
                  addBookmark.mutate({
                    videoTime: formatVideoTime(0), // Default to start of clip
                    clipTime: currentClip.startTime,
                    date: selectedDate,
                    label
                  }, {
                    onSuccess: () => {
                      toast({
                        title: "Bookmark added",
                        description: `Bookmark created at ${currentClip.startTime}`
                      });
                    },
                    onError: () => {
                      toast({
                        title: "Error",
                        description: "Failed to create bookmark",
                        variant: "destructive"
                      });
                    }
                  });
                }
              }}
              disabled={!currentClip}
            >
              <BookmarkPlus className="mr-1 h-4 w-4" />
              <span>Bookmark</span>
            </Button>
            
            <Button
              variant="outline"
              className="border-[#555555] text-[#555555] hover:bg-[#FBBC05]/10"
              onClick={() => {
                if (!currentClip) {
                  toast({
                    title: "No clip selected",
                    description: "Please select a clip to annotate",
                    variant: "destructive"
                  });
                  return;
                }
                
                const content = prompt("Enter your annotation:");
                
                if (content) {
                  createAnnotation({
                    videoTime: formatVideoTime(0), // Default to start of clip
                    clipTime: currentClip.startTime,
                    date: selectedDate,
                    content
                  });
                }
              }}
              disabled={!currentClip}
            >
              <FileEdit className="mr-1 h-4 w-4" />
              <span>Add Note</span>
            </Button>
            
            <Button
              variant="outline"
              className="border-[#555555] text-[#555555] hover:bg-[#FBBC05]/10"
              onClick={() => {
                if (!currentClip) {
                  toast({
                    title: "No clip selected",
                    description: "Please select a clip to share",
                    variant: "destructive"
                  });
                  return;
                }
                
                setIsShareModalOpen(true);
              }}
              disabled={!currentClip}
            >
              <Share2 className="mr-1 h-4 w-4" />
              <span>Share</span>
            </Button>
          </div>
          
          <div className="export-options mt-1">
            <div className="flex flex-wrap gap-1">
              <Select
                value={exportFormat}
                onValueChange={setExportFormat}
              >
                <SelectTrigger className="w-[140px] border-[#BCBBBB] text-[#555555] focus:ring-[#FBBC05]">
                  <SelectValue placeholder="Format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mp4">MP4</SelectItem>
                  <SelectItem value="webm">WebM</SelectItem>
                  <SelectItem value="mov">MOV</SelectItem>
                </SelectContent>
              </Select>
              
              <Select
                value={exportQuality}
                onValueChange={setExportQuality}
              >
                <SelectTrigger className="w-[160px] border-[#BCBBBB] text-[#555555] focus:ring-[#FBBC05]">
                  <SelectValue placeholder="Quality" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High Quality</SelectItem>
                  <SelectItem value="medium">Medium Quality</SelectItem>
                  <SelectItem value="low">Low Quality</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                variant="default"
                className="bg-[#555555] hover:bg-[#555555]/90 text-[#FFFFFF]"
                disabled={!currentClip}
                onClick={onExportCurrentClip}
              >
                <FileDown className="mr-1 h-4 w-4" />
                <span>Export Range</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Share Modal */}
      {isShareModalOpen && currentClip && (
        <ShareModal
          clip={currentClip}
          onClose={() => setIsShareModalOpen(false)}
        />
      )}
    </div>
  );
}
