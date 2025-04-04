import { useState, useEffect, useRef } from "react";
import { Clock, Save, X, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatTime } from "@/lib/time";
import { useToast } from "@/hooks/use-toast";
import { useAnnotations } from "@/hooks/use-annotations";
import type { Clip } from "@shared/schema";

interface NoteSidebarProps {
  selectedDate: string;
  currentClip?: Clip;
  currentVideoTime: number;
}

export function NoteSidebar({
  selectedDate,
  currentClip,
  currentVideoTime,
}: NoteSidebarProps) {
  const { toast } = useToast();
  const [newNote, setNewNote] = useState("");
  const [editingNote, setEditingNote] = useState<number | null>(null);
  const [editedText, setEditedText] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  // Get annotations from the server
  const { 
    data: notes = [], 
    isLoading, 
    createAnnotation, 
    updateAnnotation, 
    deleteAnnotation 
  } = useAnnotations(selectedDate);

  // Auto-scroll to current time notes
  useEffect(() => {
    if (listRef.current && currentClip && notes.length > 0) {
      const currentTimeInSeconds = currentVideoTime;
      
      // Find notes that are within 10 seconds of the current time
      const nearbyNoteIndex = notes.findIndex(
        (note: any) => {
          const clipTimeInSeconds = 
            parseInt(note.clipTime.split(":")[0]) * 60 + 
            parseInt(note.clipTime.split(":")[1]);
          return Math.abs(clipTimeInSeconds - currentTimeInSeconds) < 10;
        }
      );
      
      if (nearbyNoteIndex !== -1) {
        const noteElement = listRef.current.children[nearbyNoteIndex] as HTMLElement;
        noteElement.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }, [currentVideoTime, notes, currentClip]);

  // Handle creating a new note
  const handleCreateNote = async () => {
    if (!currentClip || !newNote.trim()) return;
    
    try {
      await createAnnotation({
        date: selectedDate,
        videoTime: formatTime(currentVideoTime),
        clipTime: currentClip.startTime,
        content: newNote.trim(),
      });
      
      setNewNote("");
      toast({
        title: "Success",
        description: "Note added successfully",
      });
    } catch (error) {
      console.error("Error creating note:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add note",
      });
    }
  };

  // Handle updating a note
  const handleUpdateNote = async (id: number) => {
    if (!editedText.trim()) return;
    
    try {
      await updateAnnotation(id, { content: editedText.trim() });
      setEditingNote(null);
      toast({
        title: "Success",
        description: "Note updated successfully",
      });
    } catch (error) {
      console.error("Error updating note:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update note",
      });
    }
  };

  // Handle deleting a note
  const handleDeleteNote = async (id: number) => {
    try {
      await deleteAnnotation(id);
      toast({
        title: "Success",
        description: "Note deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting note:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete note",
      });
    }
  };

  // Start editing a note
  const startEditing = (id: number, content: string) => {
    setEditingNote(id);
    setEditedText(content);
  };

  // Cancel editing a note
  const cancelEditing = () => {
    setEditingNote(null);
  };

  // Jump to a specific time in the video
  const jumpToTime = (timeString: string) => {
    if (!timeString) return;
    
    const [minutes, seconds] = timeString.split(":").map(Number);
    const videoElement = document.querySelector("video");
    
    if (videoElement) {
      videoElement.currentTime = minutes * 60 + seconds;
      videoElement.play().catch(err => console.error("Error playing video:", err));
    }
  };

  // Check if a time is in the current clip
  const isTimeInCurrentClip = (timeString: string): boolean => {
    if (!currentClip || !timeString) return false;
    
    const [minutes, seconds] = timeString.split(":").map(Number);
    const timeInSeconds = minutes * 60 + seconds;
    
    const startParts = currentClip.startTime.split(":");
    const startH = parseInt(startParts[0]);
    const startM = parseInt(startParts[1]);
    
    const endParts = currentClip.endTime.split(":");
    const endH = parseInt(endParts[0]);
    const endM = parseInt(endParts[1]);
    
    // Convert to seconds within the hour (for 5-minute clip comparison)
    const clipStartInSeconds = startM * 60;
    const clipEndInSeconds = (endH > startH ? 3600 : 0) + endM * 60;
    
    return timeInSeconds >= clipStartInSeconds && timeInSeconds <= clipEndInSeconds;
  };

  return (
    <div className="h-full flex flex-col border border-[#BCBBBB] rounded-md shadow bg-white">
      <div className="py-2 px-4 bg-[#555555] text-[#FBBC05] rounded-t-md font-bold text-lg">
        Notes
      </div>
      
      {/* New note input */}
      <div className="p-4 border-b border-[#BCBBBB]">
        <div className="mb-2 flex items-center text-sm text-[#555555]">
          <Clock className="w-4 h-4 mr-1" />
          <span>Current Time: {formatTime(currentVideoTime)}</span>
        </div>
        
        <Textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Add a note about this moment..."
          className="mb-2 h-20 border-[#BCBBBB]"
          disabled={!currentClip}
        />
        
        <Button
          onClick={handleCreateNote}
          disabled={!currentClip || !newNote.trim()}
          className="w-full bg-[#FBBC05] text-[#000000] hover:bg-[#FBBC05]/90"
        >
          Add Note
        </Button>
      </div>
      
      {/* List of notes */}
      <div className="h-[calc(100vh-450px)] min-h-[200px] overflow-y-auto p-2" ref={listRef}>
        {isLoading ? (
          <div className="text-center py-4 text-gray-500">Loading notes...</div>
        ) : notes.length === 0 ? (
          <div className="text-center py-4 text-gray-500">No notes for this date</div>
        ) : (
          notes.map((note: any) => (
            <Card
              key={note.id}
              className={`mb-2 ${
                isTimeInCurrentClip(note.clipTime)
                  ? "border-[#FBBC05]"
                  : "border-[#BCBBBB]"
              } shadow-sm hover:shadow transition-shadow`}
            >
              <div className="p-3">
                {editingNote === note.id ? (
                  <>
                    <Textarea
                      value={editedText}
                      onChange={(e) => setEditedText(e.target.value)}
                      className="mb-2 border-[#BCBBBB]"
                    />
                    <div className="flex justify-end space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-[#BCBBBB] text-[#555555] hover:bg-[#F5F5F5]"
                        onClick={cancelEditing}
                      >
                        <X className="w-4 h-4 mr-1" /> Cancel
                      </Button>
                      <Button
                        size="sm"
                        className="bg-[#FBBC05] text-[#000000] hover:bg-[#FBBC05]/90"
                        onClick={() => handleUpdateNote(note.id)}
                      >
                        <Save className="w-4 h-4 mr-1" /> Save
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div 
                      className="text-sm font-medium text-[#FBBC05] mb-1 cursor-pointer hover:underline flex items-center"
                      onClick={() => jumpToTime(note.clipTime)}
                    >
                      <Clock className="w-3 h-3 mr-1" />
                      {note.clipTime}
                    </div>
                    <div className="mb-2 text-[#555555]">{note.content}</div>
                    <div className="flex justify-end space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-[#BCBBBB] text-[#555555] hover:bg-[#F5F5F5]"
                        onClick={() => startEditing(note.id, note.content)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="bg-[#555555] hover:bg-[#555555]/90"
                        onClick={() => handleDeleteNote(note.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" /> Delete
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}