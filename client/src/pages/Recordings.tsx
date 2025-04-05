import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, addDays, subDays, parseISO } from "date-fns";
import { ChevronLeft, ChevronRight, FileDown, FileEdit, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VideoPlayer } from "@/components/ui/video-player";
import { Timeline } from "@/components/ui/timeline";
import { NotesFlagsSidebar } from "@/components/ui/notes-flags-sidebar";
import { ExportModal } from "@/components/ui/export-modal";
import { NoteFlagModal } from "@/components/ui/note-flag-modal";
import { ShareModal } from "@/components/ui/share-modal";
import { useToast } from "@/hooks/use-toast";
import { fetchClips } from "@/lib/s3";
import { useTimeline } from "@/hooks/use-timeline";
import { useNotesFlags } from "@/hooks/use-notes-flags";
import { formatVideoTime } from "@/lib/time";
import type { Clip } from "@shared/schema";

export default function Recordings() {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showExportModal, setShowExportModal] = useState(false);
  const [showNoteFlagModal, setShowNoteFlagModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  
  const formattedDate = format(selectedDate, "yyyy-MM-dd");
  
  // Get the note-flag creation function
  const { createNoteFlag } = useNotesFlags(formattedDate);
  
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

      <div className="flex flex-col gap-4">
        {/* Video Player - Takes the full width */}
        <div className="w-full">
          <VideoPlayer 
            clip={currentClip}
            nextClip={nextClip}
            isPlaying={isPlaying}
            currentTime={currentVideoTime}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleClipEnded}
            onPlayPause={setIsPlaying}
          />
          
          {/* Action buttons directly under the player */}
          <div className="mt-3 p-3 bg-white rounded-lg shadow border border-[#BCBBBB] flex flex-wrap gap-2">
            <Button
              variant="default"
              className="bg-[#FBBC05] hover:bg-[#FBBC05]/90 text-[#000000]"
              onClick={handleExportCurrentClip}
              disabled={!currentClip}
            >
              <FileDown className="mr-1 h-4 w-4" />
              <span>Export</span>
            </Button>
            
            <Button
              variant="outline"
              className="border-[#555555] text-[#555555] hover:bg-[#FBBC05]/10"
              onClick={() => {
                if (!currentClip) {
                  toast({
                    title: "No clip selected",
                    description: "Please select a clip to add a note or flag",
                    variant: "destructive"
                  });
                  return;
                }
                
                // We'll implement this functionality
                setShowNoteFlagModal(true);
              }}
              disabled={!currentClip}
            >
              <FileEdit className="mr-1 h-4 w-4" />
              <span>Note / Flag</span>
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
                
                setShowShareModal(true);
              }}
              disabled={!currentClip}
            >
              <Share2 className="mr-1 h-4 w-4" />
              <span>Share</span>
            </Button>
          </div>
        </div>
        
        {/* Timeline and Controls - Below the video */}
        <div className="w-full">
          <Timeline 
            clips={clips}
            currentClip={currentClip}
            isLoading={isLoading}
            isError={isError}
            onSelectClip={(clip) => {
              setCurrentClip(clip);
              setIsPlaying(true); // Auto-play when clip is selected
            }}
            onExportCurrentClip={handleExportCurrentClip}
            selectedDate={formattedDate}
          />
        </div>
        
        {/* Notes/Flags Section - At the bottom of the page */}
        <div className="w-full">
          <NotesFlagsSidebar 
            selectedDate={formattedDate}
            currentClip={currentClip}
            currentVideoTime={currentVideoTime}
          />
        </div>
      </div>
      
      {/* Export Modal */}
      {showExportModal && (
        <ExportModal 
          clip={currentClip}
          onClose={() => setShowExportModal(false)} 
        />
      )}
      
      {/* Note/Flag Modal */}
      {showNoteFlagModal && currentClip && (
        <NoteFlagModal
          clip={currentClip}
          date={formattedDate}
          onSave={(content, isFlag) => {
            createNoteFlag.mutate({
              videoTime: formatVideoTime(currentVideoTime || 0),
              clipTime: currentClip.startTime,
              date: formattedDate,
              content: content || null,
              isFlag
            }, {
              onSuccess: () => {
                toast({
                  title: isFlag ? (content ? "Note & Flag added" : "Flag added") : "Note added",
                  description: `Added to clip at ${currentClip.startTime}`
                });
              },
              onError: () => {
                toast({
                  title: "Error",
                  description: "Failed to save note/flag",
                  variant: "destructive"
                });
              }
            });
            setShowNoteFlagModal(false);
          }}
          onClose={() => setShowNoteFlagModal(false)}
        />
      )}
      
      {/* Share Modal */}
      {showShareModal && currentClip && (
        <ShareModal
          clip={currentClip}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
}