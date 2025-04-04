import { useRef, useEffect, useState } from "react";
import { AlertTriangle, Loader2, ZoomIn, ZoomOut, Bookmark, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import type { Clip, Annotation, Bookmark as BookmarkType } from "@shared/schema";
import { useBookmarks } from "@/hooks/use-bookmarks";
import { useAnnotations } from "@/hooks/use-annotations";

interface TimelineProps {
  clips: Clip[];
  currentClip?: Clip;
  isLoading: boolean;
  isError: boolean;
  onSelectClip: (clip: Clip) => void;
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
  onSelectClip
}: TimelineProps) {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1); // Default zoom level
  const [focusHour, setFocusHour] = useState<number>(9); // Default focus on 9 AM
  const [activePreset, setActivePreset] = useState<string>('full-day'); // Default preset
  const selectedDate = currentClip?.date || new Date().toISOString().split('T')[0];
  
  // Fetch bookmarks and annotations for the selected date
  const { bookmarks = [] } = useBookmarks(selectedDate);
  const { annotations = [] } = useAnnotations(selectedDate);
  
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
    const segmentAnnotations = annotations.filter(anno => {
      // Check if the annotation clipTime matches the segment
      return anno.clipTime === clipTime;
    });
    
    // Find bookmarks for this segment
    const segmentBookmarks = bookmarks.filter(bookmark => {
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
    <div className="timeline-container mt-8">
      <div className="flex items-center mb-2">
        <h2 className="text-lg font-medium text-[#555555]">Timeline - Working Hours (7am-5pm)</h2>
        
        <div className="ml-auto flex space-x-4 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-[#FBBC05] rounded-full mr-1"></div>
            <span className="text-[#555555]">Available Clips</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-[#555555] rounded-full mr-1"></div>
            <span className="text-[#555555]">No Footage</span>
          </div>
          <div className="flex items-center">
            <Bookmark className="h-4 w-4 text-[#000000] fill-[#FBBC05] mr-1" />
            <span className="text-[#555555]">Bookmark</span>
          </div>
          <div className="flex items-center">
            <MessageSquare className="h-4 w-4 text-[#000000] fill-[#FBBC05] mr-1" />
            <span className="text-[#555555]">Annotation</span>
          </div>
        </div>
      </div>
      
      {/* Smart Zoom Presets */}
      <div className="zoom-presets flex flex-wrap items-center gap-2 mb-2">
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
      <div className="zoom-controls flex items-center gap-2 mb-2">
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
        <div className="timeline-scroll-container overflow-x-scroll bg-[#FFFFFF] rounded-lg shadow border border-[#BCBBBB] h-[200px] flex-1 relative" style={{
          scrollbarWidth: 'auto',
          scrollbarColor: '#555555 #FFFFFF',
          overflowY: 'visible',
          paddingBottom: '30px',
          paddingTop: '20px'
        }}>
          <div 
            ref={timelineRef}
            className="timeline-wrapper relative p-4"
            style={{ width: "150%" }}
          >
            {/* Hour markers - filter based on zoom level */}
            <div className="hour-markers relative h-8">
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
            <div className="timeline-segments flex h-8 mt-8">
              {visibleSegments.map((segment, index) => (
                <div
                  key={index}
                  className={`timeline-segment hover:opacity-80 transition-opacity ${
                    segment.hasClip ? 'bg-[#FBBC05]' : 'bg-[#555555]'
                  } ${
                    segment.isCurrent ? 'ring-2 ring-[#000000]' : ''
                  } ${
                    segment.isWorkingHour ? 'h-8' : 'h-6 mt-1'
                  }`}
                  style={{ width: `${segmentWidth}%` }}
                  title={segment.displayTime}
                  onClick={() => segment.hasClip && segment.clip && onSelectClip(segment.clip)}
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
                  
                  {/* Bookmark indicator */}
                  {segment.hasBookmarks && (
                    <div 
                      className="absolute bottom-0 left-0 w-full h-full cursor-pointer z-10 group"
                      onClick={(e) => {
                        e.stopPropagation();
                        const clip = findClipByTime(segment.time);
                        if (clip) onSelectClip(clip);
                      }}
                    >
                      <div className="absolute bottom-0 left-0 w-full flex justify-center items-center">
                        <Bookmark className="h-5 w-5 text-[#000000] fill-[#FBBC05] stroke-[1.5]" />
                        {segment.bookmarks && segment.bookmarks.length > 1 && (
                          <span className="absolute top-0 right-0 bg-[#000000] text-[#FFFFFF] text-[10px] px-1 rounded-full">
                            {segment.bookmarks.length}
                          </span>
                        )}
                      </div>
                      {segment.bookmarks && segment.bookmarks.length > 0 && (
                        <div className="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 bg-[#000000] text-[#FFFFFF] px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                          {segment.bookmarks.length > 1 
                            ? `${segment.bookmarks.length} bookmarks` 
                            : segment.bookmarks[0].label || 'Bookmark'}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Annotation indicator */}
                  {segment.hasAnnotations && (
                    <div 
                      className="absolute top-0 left-1/2 transform -translate-x-1/2 -mt-6 cursor-pointer z-10 group"
                      onClick={(e) => {
                        e.stopPropagation();
                        const clip = findClipByTime(segment.time);
                        if (clip) onSelectClip(clip);
                      }}
                    >
                      <MessageSquare className="h-5 w-5 text-[#000000] fill-[#FBBC05] stroke-[1.5]" />
                      {segment.annotations && segment.annotations.length > 0 && (
                        <div className="absolute top-full mt-1 left-1/2 transform -translate-x-1/2 bg-[#000000] text-[#FFFFFF] px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                          {segment.annotations.length > 1 
                            ? `${segment.annotations.length} annotations` 
                            : segment.annotations[0].content?.substring(0, 20) + (segment.annotations[0].content?.length > 20 ? '...' : '') || 'Annotation'}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
