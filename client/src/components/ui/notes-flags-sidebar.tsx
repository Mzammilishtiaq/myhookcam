import { useState, useRef, useEffect } from "react";
import { 
  Bookmark, Flag, Pencil, Trash2, Clock, Check, ChevronUp, ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useNotesFlags } from "@/hooks/use-notes-flags";
import { formatTime } from "@/lib/time";
import type { Clip } from "@shared/schema";

interface NotesFlagsSidebarProps {
  selectedDate: string;
  currentClip?: Clip;
  currentVideoTime: number;
}

export function NotesFlagsSidebar({
  selectedDate,
  currentClip,
  currentVideoTime,
}: NotesFlagsSidebarProps) {
  const { toast } = useToast();
  const [newNoteText, setNewNoteText] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editedText, setEditedText] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  // Get notes and flags from the server
  const { 
    notes, 
    isLoading, 
    createNoteFlag, 
    updateNoteFlag, 
    deleteNoteFlag 
  } = useNotesFlags(selectedDate);

  // Auto-scroll to current time notes/flags
  useEffect(() => {
    if (listRef.current && currentClip && notes.length > 0) {
      const currentTimeInSeconds = currentVideoTime;
      
      // Find notes that are within 10 seconds of the current time
      const nearbyItemIndex = notes.findIndex(
        (note) => {
          const clipTimeInSeconds = 
            parseInt(note.clipTime.split(":")[0]) * 60 + 
            parseInt(note.clipTime.split(":")[1]);
          return Math.abs(clipTimeInSeconds - currentTimeInSeconds) < 10;
        }
      );
      
      if (nearbyItemIndex !== -1) {
        const noteElement = listRef.current.children[nearbyItemIndex] as HTMLElement;
        noteElement.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }, [currentVideoTime, notes, currentClip]);

  // Save a new note or flag
  const handleSave = (flagOnly: boolean = false) => {
    if (!currentClip) {
      toast({
        title: "No clip selected",
        description: "Please select a video clip first",
        variant: "destructive"
      });
      return;
    }
    
    const content = flagOnly ? "" : newNoteText.trim();
    
    if (!flagOnly && !content) {
      toast({
        title: "Empty note",
        description: "Please enter some text for your note",
        variant: "destructive"
      });
      return;
    }
    
    createNoteFlag.mutate({
      videoTime: formatTime(currentVideoTime),
      clipTime: currentClip.startTime,
      date: selectedDate,
      content: content, 
      isFlag: flagOnly || false
    }, {
      onSuccess: () => {
        setNewNoteText("");
        toast({
          title: flagOnly ? "Flag added" : "Note saved",
          description: flagOnly 
            ? `Marked clip at ${currentClip.startTime} as important` 
            : `Note added at ${currentClip.startTime}`,
          variant: "default"
        });
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: `Failed to save: ${error}`,
          variant: "destructive"
        });
      }
    });
  };

  // Handle creating a flag without note
  const handleCreateFlag = () => handleSave(true);
  
  // Handle creating a note
  const handleCreateNote = () => handleSave(false);

  // Start editing a note
  const startEditing = (id: number, content: string) => {
    setEditingId(id);
    setEditedText(content || "");
  };

  // Save edited note
  const saveEdit = (id: number) => {
    if (!editedText.trim()) {
      toast({
        title: "Empty note",
        description: "Note content cannot be empty",
        variant: "destructive"
      });
      return;
    }

    updateNoteFlag.mutate({
      id,
      content: editedText.trim()
    }, {
      onSuccess: () => {
        setEditingId(null);
        setEditedText("");
        toast({
          title: "Note updated",
          description: "Your note has been updated successfully",
          variant: "default"
        });
      }
    });
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null);
    setEditedText("");
  };

  // Delete a note or flag
  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this item?")) {
      deleteNoteFlag.mutate(id, {
        onSuccess: () => {
          toast({
            title: "Deleted",
            description: "Item has been deleted",
            variant: "default"
          });
        }
      });
    }
  };

  // Jump to a specific time in the video
  const jumpToTime = (clipTime: string) => {
    // This function would be implemented by the parent component
    // through a callback prop if needed
    console.log("Jump to clip time:", clipTime);
  };

  const sortedNotes = [...notes].sort((a, b) => {
    // Sort by clip time (convert to minutes for comparison)
    const aMinutes = parseInt(a.clipTime.split(":")[0]) * 60 + parseInt(a.clipTime.split(":")[1]);
    const bMinutes = parseInt(b.clipTime.split(":")[0]) * 60 + parseInt(b.clipTime.split(":")[1]);
    return aMinutes - bMinutes;
  });

  return (
    <div className="flex flex-col border border-[#BCBBBB] rounded-md shadow bg-white">
      <div 
        className="flex items-center justify-between bg-[#FBBC05] p-3 cursor-pointer rounded-t-md"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="font-semibold text-[#000000] flex items-center">
          {isExpanded ? <ChevronUp className="h-5 w-5 mr-2" /> : <ChevronDown className="h-5 w-5 mr-2" />}
          Notes/Flags
          {sortedNotes.length > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-[#555555] text-white text-xs rounded-full">
              {sortedNotes.length}
            </span>
          )}
        </h3>
      </div>
      
      {isExpanded && (
        <div className="flex flex-col md:flex-row">
          {/* Input area */}
          <div className="p-4 border-b md:border-b-0 md:border-r border-[#BCBBBB] md:w-1/3">
            <div className="mb-2 flex items-center text-sm text-[#555555]">
              <Clock className="w-4 h-4 mr-1" />
              <span>Current Time: {formatTime(currentVideoTime)}</span>
            </div>
            
            <Textarea
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              placeholder="Add a note about this moment..."
              className="mb-2 h-20 border-[#BCBBBB]"
              disabled={!currentClip}
            />
            
            <div className="flex gap-2">
              <Button
                onClick={handleCreateNote}
                disabled={!currentClip || !newNoteText.trim()}
                className="flex-1 bg-[#FBBC05] text-[#000000] hover:bg-[#FBBC05]/90"
              >
                <Pencil className="w-4 h-4 mr-1" /> Add Note
              </Button>
              
              <Button
                onClick={handleCreateFlag}
                disabled={!currentClip}
                className="flex-1 bg-[#555555] text-white hover:bg-[#555555]/90"
              >
                <Flag className="w-4 h-4 mr-1" /> Flag
              </Button>
            </div>
          </div>
          
          {/* List of notes and flags */}
          <div className="flex-1 h-[300px] overflow-y-auto p-2 md:w-2/3" ref={listRef}>
            {isLoading ? (
              <div className="text-center py-4 text-gray-500">Loading...</div>
            ) : sortedNotes.length === 0 ? (
              <div className="text-center py-4 text-gray-500">No notes or flags for this date</div>
            ) : (
              sortedNotes.map((item) => (
                <Card key={item.id} className="mb-2 p-3 hover:shadow-md transition-shadow">
                  <div className="flex flex-col">
                    {editingId === item.id ? (
                      <>
                        <Textarea
                          value={editedText}
                          onChange={(e) => setEditedText(e.target.value)}
                          className="mb-2 h-20 border-[#BCBBBB]"
                          autoFocus
                        />
                        <div className="flex justify-end space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={cancelEdit}
                            className="border-[#BCBBBB] text-[#555555]"
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => saveEdit(item.id)}
                            className="bg-[#FBBC05] text-[#000000] hover:bg-[#FBBC05]/90"
                          >
                            <Check className="w-4 h-4 mr-1" /> Save
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div 
                          className="text-sm font-medium mb-1 cursor-pointer hover:underline flex items-center"
                          onClick={() => jumpToTime(item.clipTime)}
                        >
                          <Clock className="w-3 h-3 mr-1" />
                          <span className={`${item.isFlag ? "text-[#555555]" : "text-[#FBBC05]"}`}>
                            {item.clipTime}
                          </span>
                          {item.isFlag && (
                            <Flag className="w-3 h-3 ml-2 text-[#FBBC05]" />
                          )}
                        </div>
                        
                        {/* Video clip filename */}
                        <div className="text-xs text-[#555555] mb-1 font-mono">
                          File: {item.date}_
                          {item.clipTime.replace(':', '')}.mp4
                        </div>
                        
                        {/* Video clip time (formatted) */}
                        <div className="text-xs text-[#555555] mb-1">
                          <span className="font-medium">Video position:</span> {item.videoTime}
                        </div>
                        
                        {item.content && (
                          <div className="mb-2 text-[#555555] border-t border-[#BCBBBB] mt-2 pt-2">{item.content}</div>
                        )}
                        
                        <div className="flex justify-end space-x-2">
                          {item.content && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-[#BCBBBB] text-[#555555] hover:bg-[#F5F5F5]"
                              onClick={() => startEditing(item.id, item.content || "")}
                            >
                              Edit
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            className="bg-[#555555] hover:bg-[#555555]/90"
                            onClick={() => handleDelete(item.id)}
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
      )}
    </div>
  );
}