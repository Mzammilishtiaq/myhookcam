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
import { ClipTable } from "@/components/ui/clip-table";
import { Weather, ClipWeather } from "@/components/ui/weather";
import { useToast } from "@/hooks/use-toast";
import { fetchClips } from "@/lib/s3";
import { useTimeline } from "@/hooks/use-timeline";
import { useNotesFlags } from "@/hooks/use-notes-flags";
import { formatVideoTime, formatTime, timeToSeconds } from "@/lib/time";
import type { Clip, NoteFlag } from "@shared/schema";

// Helper function to calculate end time for a clip
function getEndTime(clip: Clip): string {
  const [hours, minutes] = clip.startTime.split(':').map(Number);
  let newMinutes = minutes + 5;
  let newHours = hours;
  
  if (newMinutes >= 60) {
    newMinutes -= 60;
    newHours = (newHours + 1) % 24;
  }
  
  return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
}

export default function Recordings() {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showExportModal, setShowExportModal] = useState(false);
  const [showNoteFlagModal, setShowNoteFlagModal] = useState(false);
  const [editingNoteFlag, setEditingNoteFlag] = useState<NoteFlag | undefined>(undefined);
  const [showShareModal, setShowShareModal] = useState(false);
  
  const formattedDate = format(selectedDate, "yyyy-MM-dd");
  
  // Get the notes/flags data and creation function
  const { notesFlags, createNoteFlag, updateNoteFlag, deleteNoteFlag } = useNotesFlags(formattedDate);
  
  // Debug: Log notes/flags whenever they change
  console.log('Notes/Flags for date:', formattedDate, notesFlags);
  
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
      <div className="mb-2 flex justify-between items-center">
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
      
      {/* Weather Card - Below date picker */}
      <div className="mb-4">
        <Weather date={formattedDate} className="w-full" />
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
          
          {/* Action buttons and clip info below the player */}
          <div className="mt-3 p-3 bg-white rounded-lg shadow border border-[#BCBBBB]">
            <div className="flex flex-wrap items-center justify-between mb-2">
              <div className="flex flex-wrap gap-2">
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
                    
                    // Check if there's an existing note/flag for this clip
                    const existingNote = notesFlags.find(nf => nf.clipTime === currentClip.startTime);
                    
                    if (existingNote) {
                      // If found, we're editing
                      console.log('Found existing note/flag to edit:', existingNote);
                      setEditingNoteFlag(existingNote);
                    } else {
                      // If not found, we're creating new
                      setEditingNoteFlag(undefined);
                    }
                    
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
            
            {/* Clip info and weather - Below the action buttons */}
            {currentClip && (
              <div className="flex flex-col mt-2 border-t border-[#BCBBBB] pt-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-[#555555]">
                    <span className="font-medium">Start Time:</span> {currentClip.startTime}
                    <span className="mx-2">|</span>
                    <span className="font-medium">End Time:</span> {getEndTime(currentClip)}
                  </div>
                </div>
                
                {/* Weather below the times */}
                <div className="mt-2">
                  <ClipWeather 
                    date={formattedDate} 
                    time={currentClip.startTime} 
                    className="p-1" 
                  />
                </div>
              </div>
            )}
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
        
        {/* Clip Table - Shows all clips in a tabular format */}
        <div className="w-full">
          <ClipTable 
            clips={clips}
            notesFlags={notesFlags}
            date={formattedDate}
            createNoteFlag={createNoteFlag}
            updateNoteFlag={updateNoteFlag}
            deleteNoteFlag={deleteNoteFlag}
            onClipSelect={(clip) => {
              setCurrentClip(clip);
              setIsPlaying(true); // Auto-play when clip is selected
            }}
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
          existingNote={editingNoteFlag}
          onSave={(content, isFlag) => {
            const noteData = {
              videoTime: formatVideoTime(currentVideoTime || 0),
              clipTime: currentClip.startTime,
              date: formattedDate,
              content: content || null,
              isFlag
            };
            
            if (editingNoteFlag) {
              // Update existing note/flag
              console.log('Updating existing note/flag:', noteData);
              
              updateNoteFlag.mutate({ 
                id: editingNoteFlag.id, 
                ...noteData
              }, {
                onSuccess: (data) => {
                  console.log('Successfully updated note/flag:', data);
                  toast({
                    title: isFlag ? (content ? "Note & Flag updated" : "Flag updated") : "Note updated",
                    description: `Updated for clip at ${currentClip.startTime}`
                  });
                },
                onError: (error) => {
                  console.error('Failed to update note/flag:', error);
                  toast({
                    title: "Error",
                    description: "Failed to update note/flag",
                    variant: "destructive"
                  });
                }
              });
            } else {
              // Create new note/flag
              console.log('Creating new note/flag:', noteData);
              
              createNoteFlag.mutate(noteData, {
                onSuccess: (data) => {
                  console.log('Successfully created note/flag:', data);
                  toast({
                    title: isFlag ? (content ? "Note & Flag added" : "Flag added") : "Note added",
                    description: `Added to clip at ${currentClip.startTime}`
                  });
                },
                onError: (error) => {
                  console.error('Failed to create note/flag:', error);
                  toast({
                    title: "Error",
                    description: "Failed to save note/flag",
                    variant: "destructive"
                  });
                }
              });
            }
            
            setShowNoteFlagModal(false);
            setEditingNoteFlag(undefined);
          }}
          onDelete={(id) => {
            console.log('Deleting note/flag with id:', id);
            
            deleteNoteFlag.mutate(id, {
              onSuccess: () => {
                console.log('Successfully deleted note/flag');
                toast({
                  title: "Deleted",
                  description: `Note/flag for clip at ${currentClip.startTime} has been deleted`
                });
              },
              onError: (error) => {
                console.error('Failed to delete note/flag:', error);
                toast({
                  title: "Error",
                  description: "Failed to delete note/flag",
                  variant: "destructive"
                });
              }
            });
            
            setShowNoteFlagModal(false);
            setEditingNoteFlag(undefined);
          }}
          onClose={() => {
            setShowNoteFlagModal(false);
            setEditingNoteFlag(undefined);
          }}
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