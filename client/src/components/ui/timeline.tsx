import { useRef, useEffect, useState } from "react";
import { 
  AlertTriangle, Loader2, ZoomIn, ZoomOut, Bookmark, MessageSquare,
  FileDown, BookmarkPlus, FileEdit, Share2, Flag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { VideoPreview } from "@/components/ui/video-preview";
import type { Clip, NoteFlag } from "@shared/schema";
import { useNotesFlags } from "@/hooks/use-notes-flags";
import { useToast } from "@/hooks/use-toast";
import { formatVideoTime } from "@/lib/time";
import { ShareModal } from "@/components/ui/share-modal";
import { NoteFlagModal } from "@/components/ui/note-flag-modal";

interface TimelineProps {
  clips: Clip[];
  currentClip?: Clip;
  isLoading: boolean;
  isError: boolean;
  onSelectClip: (clip: Clip) => void;
  onExportCurrentClip: () => void;
  selectedDate: string;
}

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
  const [scrollLeft, setScrollLeft] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);
  const [visibleWidth, setVisibleWidth] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isNoteFlagModalOpen, setIsNoteFlagModalOpen] = useState(false);
  
  const { toast } = useToast();
  const { notesFlags, createNoteFlag } = useNotesFlags(selectedDate);
  
  // Calculate content width based on zoom level
  useEffect(() => {
    const minutesPerDay = 24 * 60;
    const secondsPerDay = minutesPerDay * 60;
    const baseWidth = 2000; // Width at 100% zoom
    const width = baseWidth * (zoomLevel / 100);
    setContentWidth(width);
  }, [zoomLevel]);
  
  // Update visible width when the timeline container resizes
  useEffect(() => {
    if (!timelineRef.current) return;
    
    const updateVisibleWidth = () => {
      if (timelineRef.current) {
        setVisibleWidth(timelineRef.current.clientWidth);
      }
    };
    
    updateVisibleWidth();
    
    const observer = new ResizeObserver(updateVisibleWidth);
    observer.observe(timelineRef.current);
    
    return () => {
      if (timelineRef.current) {
        observer.unobserve(timelineRef.current);
      }
    };
  }, []);
  
  // Generate hour marks
  const hourMarks = [];
  for (let hour = 0; hour < 24; hour++) {
    const formattedHour = hour.toString().padStart(2, "0");
    hourMarks.push(
      <div 
        key={hour} 
        className="absolute flex flex-col items-center"
        style={{ 
          left: `${(hour / 24) * 100}%`,
          top: 0,
          transform: 'translateX(-50%)'
        }}
      >
        <div className="text-xs text-[#555555] w-10 text-center font-medium">{formattedHour}:00</div>
        <div className="h-5 w-px bg-[#BCBBBB] mt-1"></div>
      </div>
    );
  }
  
  // Handle zoom in/out
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 25, 500));
  };
  
  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 25, 25));
  };
  
  // Handle scroll with slider
  const handleScrollChange = (newValue: number[]) => {
    const scrollPercentage = newValue[0];
    const maxScroll = contentWidth - visibleWidth;
    const newScrollLeft = (scrollPercentage / 100) * maxScroll;
    
    if (timelineRef.current) {
      timelineRef.current.scrollLeft = newScrollLeft;
      setScrollLeft(newScrollLeft);
    }
  };
  
  // Update scroll percentage when scrolling the timeline
  const handleScroll = () => {
    if (timelineRef.current) {
      setScrollLeft(timelineRef.current.scrollLeft);
    }
  };
  
  // Calculate scroll percentage for the slider
  const scrollPercentage = contentWidth > visibleWidth 
    ? (scrollLeft / (contentWidth - visibleWidth)) * 100 
    : 0;
  
  // Find if a clip has notes or flags
  const getClipAnnotations = (clip: Clip) => {
    if (!notesFlags) return { hasNotes: false, hasFlags: false };
    
    const clipNotes = notesFlags.filter((note: NoteFlag) => 
      note.clipTime === clip.startTime && note.date === selectedDate
    );
    
    const hasNotes = clipNotes.some((note: NoteFlag) => note.content !== null);
    const hasFlags = clipNotes.some((note: NoteFlag) => note.isFlag);
    
    return { hasNotes, hasFlags };
  };
  
  // Generate the timeline clips
  const renderClips = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-24">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      );
    }
    
    if (isError) {
      return (
        <div className="flex justify-center items-center h-24 text-red-500">
          <AlertTriangle className="h-8 w-8 mr-2" />
          <span>Error loading clips</span>
        </div>
      );
    }
    
    if (!clips || clips.length === 0) {
      return (
        <div className="flex justify-center items-center h-24 text-gray-500">
          No clips available for this date
        </div>
      );
    }
    
    return (
      <div 
        className="relative mt-4"
        style={{ 
          height: '120px', 
          width: `${contentWidth}px` 
        }}
      >
        {clips.map(clip => {
          const startTimeParts = clip.startTime.split(':').map(Number);
          const endTimeParts = clip.endTime.split(':').map(Number);
          
          const startHour = startTimeParts[0];
          const startMinute = startTimeParts[1];
          const startSecond = startTimeParts[2] || 0;
          
          const endHour = endTimeParts[0];
          const endMinute = endTimeParts[1];
          const endSecond = endTimeParts[2] || 0;
          
          const startTimeInSeconds = startHour * 3600 + startMinute * 60 + startSecond;
          const endTimeInSeconds = endHour * 3600 + endMinute * 60 + endSecond;
          
          const totalSecondsInDay = 24 * 60 * 60;
          
          const startPercentage = (startTimeInSeconds / totalSecondsInDay) * 100;
          const endPercentage = (endTimeInSeconds / totalSecondsInDay) * 100;
          const width = endPercentage - startPercentage;
          
          const { hasNotes, hasFlags } = getClipAnnotations(clip);
          
          let clipBgColor = "bg-[#FFFFFF]";
          let clipBorderColor = "border-[#BCBBBB]";
          
          if (hasNotes && hasFlags) {
            clipBgColor = "bg-[#FBBC05]/20";
            clipBorderColor = "border-[#FBBC05]";
          } else if (hasNotes) {
            clipBgColor = "bg-[#FBBC05]/10";
            clipBorderColor = "border-[#FBBC05]/80";
          } else if (hasFlags) {
            clipBgColor = "bg-[#FBBC05]/5";
            clipBorderColor = "border-[#FBBC05]/60";
          }
          
          const isSelected = currentClip && currentClip.key === clip.key;
          if (isSelected) {
            clipBgColor += " ring-2 ring-[#FBBC05] ring-offset-1";
            clipBorderColor = "border-[#FBBC05]";
          }
          
          return (
            <div
              key={clip.key}
              className={`absolute cursor-pointer border-2 ${clipBorderColor} ${clipBgColor} hover:shadow-lg transition-all duration-200 overflow-hidden`}
              style={{
                left: `${startPercentage}%`,
                width: `${width}%`,
                top: 0,
                height: '100%',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}
              onClick={() => onSelectClip(clip)}
            >
              <VideoPreview 
                clipKey={clip.key} 
                className="h-full w-full object-cover opacity-95"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-[#000000] bg-opacity-70 text-[#FFFFFF] text-xs px-2 py-1 font-medium">
                {clip.startTime}
              </div>
              {(hasNotes || hasFlags) && (
                <div className="absolute top-1 right-1 flex space-x-1 bg-[#000000] bg-opacity-50 rounded-sm p-0.5">
                  {hasNotes && <MessageSquare size={14} className="text-[#FBBC05]" />}
                  {hasFlags && <Flag size={14} className="text-[#FBBC05]" />}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };
  
  return (
    <div className="flex flex-col space-y-2 w-full h-full">
      <div className="flex justify-between items-center mb-2 w-full">
        <div className="text-sm font-medium text-[#555555]">Timeline - {selectedDate}</div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomOut}
            disabled={zoomLevel <= 25}
            className="border-[#BCBBBB] text-[#555555] hover:bg-[#F5F5F5]"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-xs w-16 text-center text-[#555555] font-medium">{zoomLevel}%</span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomIn}
            disabled={zoomLevel >= 500}
            className="border-[#BCBBBB] text-[#555555] hover:bg-[#F5F5F5]"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="w-full h-[150px] border border-[#BCBBBB] rounded-lg overflow-hidden relative">
        <div className="relative h-8 bg-[#F5F5F5] w-full border-b border-[#BCBBBB] px-2">
          {hourMarks}
        </div>
        
        <div 
          ref={timelineRef}
          className="overflow-x-auto w-full h-[112px] hide-scrollbar bg-white"
          onScroll={handleScroll}
        >
          {renderClips()}
        </div>
        
        {contentWidth > visibleWidth && (
          <div className="absolute bottom-0 left-0 right-0 px-4 py-2 bg-[#F5F5F5] border-t border-[#BCBBBB]">
            <Slider
              value={[scrollPercentage]}
              min={0}
              max={100}
              step={0.1}
              onValueChange={handleScrollChange}
              className="w-full"
            />
          </div>
        )}
      </div>
      
      {/* Action buttons */}
      <div className="flex justify-between items-center pt-2 pb-1">
        <div className="text-xs text-gray-500">
          {!isError && !isLoading && clips && `${clips.length} clips available`}
        </div>
      </div>
    </div>
  );
}
