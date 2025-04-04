import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, addDays, subDays, parseISO } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { VideoPlayer } from "@/components/ui/video-player";
import { Timeline } from "@/components/ui/timeline";
import { ClipControls } from "@/components/ui/clip-controls";
import { NoteSidebar } from "@/components/ui/note-sidebar";
import { ExportModal } from "@/components/ui/export-modal";
import { useToast } from "@/hooks/use-toast";
import { fetchClips } from "@/lib/s3";
import { useTimeline } from "@/hooks/use-timeline";
import type { Clip } from "@shared/schema";

export default function Recordings() {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showExportModal, setShowExportModal] = useState(false);
  
  const formattedDate = format(selectedDate, "yyyy-MM-dd");
  
  const {
    currentClip,
    nextClip,
    isPlaying,
    currentVideoTime,
    setCurrentClip,
    setIsPlaying,
    handleTimeUpdate,
    handleClipEnded
  } = useTimeline(formattedDate);
  
  // Fetch clips for the selected date
  const { data: clips = [], isLoading, isError } = useQuery({
    queryKey: ['/api/clips', formattedDate],
    queryFn: () => fetchClips(formattedDate)
  });
  
  // Handle date navigation
  const goToNextDay = () => setSelectedDate(addDays(selectedDate, 1));
  const goToPreviousDay = () => setSelectedDate(subDays(selectedDate, 1));
  
  // Handle showing export modal
  const handleExportCurrentClip = () => {
    if (currentClip) {
      setShowExportModal(true);
    } else {
      toast({
        title: "No clip selected",
        description: "Please select a clip to export",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="container mx-auto p-4">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-[#555555]"><span className="text-[#FBBC05]">HookCam</span> Recording Archive</h2>
        
        {/* Date Picker */}
        <div className="flex items-center space-x-2">
          <button 
            className="p-1 rounded hover:bg-[#FBBC05] hover:text-[#000000]"
            onClick={goToPreviousDay}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <input 
            type="date" 
            className="bg-[#FBBC05] text-[#000000] font-medium px-3 py-1 rounded border border-[#000000]" 
            value={formattedDate}
            onChange={(e) => setSelectedDate(parseISO(e.target.value))}
          />
          <button 
            className="p-1 rounded hover:bg-[#FBBC05] hover:text-[#000000]"
            onClick={goToNextDay}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
        {/* Video and Timeline Section */}
        <div className="flex-grow">
          <VideoPlayer 
            clip={currentClip}
            nextClip={nextClip}
            isPlaying={isPlaying}
            currentTime={currentVideoTime}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleClipEnded}
            onPlayPause={setIsPlaying}
          />
          
          <Timeline 
            clips={clips}
            currentClip={currentClip}
            isLoading={isLoading}
            isError={isError}
            onSelectClip={setCurrentClip}
          />
          
          <ClipControls 
            currentClip={currentClip}
            onExportCurrentClip={handleExportCurrentClip}
            selectedDate={formattedDate}
          />
        </div>
        
        {/* Sidebar */}
        <NoteSidebar 
          selectedDate={formattedDate}
          currentClip={currentClip}
          currentVideoTime={currentVideoTime}
        />
      </div>
      
      {/* Export Modal */}
      {showExportModal && (
        <ExportModal 
          clip={currentClip}
          onClose={() => setShowExportModal(false)} 
        />
      )}
    </div>
  );
}