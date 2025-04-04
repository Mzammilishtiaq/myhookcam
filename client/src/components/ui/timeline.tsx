import { useRef, useEffect } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import type { Clip } from "@shared/schema";

interface TimelineProps {
  clips: Clip[];
  currentClip?: Clip;
  isLoading: boolean;
  isError: boolean;
  onSelectClip: (clip: Clip) => void;
}

export function Timeline({
  clips,
  currentClip,
  isLoading,
  isError,
  onSelectClip
}: TimelineProps) {
  const timelineRef = useRef<HTMLDivElement>(null);
  
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
        
        segments.push({
          time: timeKey,
          displayTime,
          hasClip: segmentMap.has(timeKey),
          clip: segmentMap.get(timeKey),
          isCurrent: currentClip && currentClip.startTime === timeKey,
          isWorkingHour
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
  
  // Calculate width for each segment
  const segmentWidth = 0.35; // Percentage width of the container
  
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
        <div className="timeline-scroll-container overflow-x-auto bg-[#FFFFFF] rounded-lg shadow border border-[#BCBBBB]">
          <div 
            ref={timelineRef}
            className="timeline-wrapper relative min-w-max p-4"
          >
            {/* Hour markers */}
            <div className="hour-markers relative h-8">
              {hourMarkers.map((marker) => (
                <div 
                  key={marker.hour}
                  className={`hour-marker absolute border-l ${
                    marker.isWorkingHour ? 'border-[#555555] border-l-2' : 'border-[#BCBBBB]'
                  }`}
                  style={{ left: `${marker.position}%` }}
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
              {timeSegments.map((segment, index) => (
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
                  data-time={segment.displayTime}
                  onClick={() => segment.hasClip && segment.clip && onSelectClip(segment.clip)}
                >
                  {segment.isCurrent && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 bg-[#000000] text-[#FFFFFF] px-2 py-1 rounded text-xs font-mono whitespace-nowrap">
                      Now Playing
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
