import { useState } from "react";
import { Edit, Trash2, AlertCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAnnotations } from "@/hooks/use-annotations";
import { useBookmarks } from "@/hooks/use-bookmarks";
import { formatVideoTime } from "@/lib/time";
import type { Clip } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface NoteSidebarProps {
  selectedDate: string;
  currentClip?: Clip;
  currentVideoTime: number;
}

export function NoteSidebar({
  selectedDate,
  currentClip,
  currentVideoTime
}: NoteSidebarProps) {
  const [activeTab, setActiveTab] = useState<string>("notes");
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showBookmarkModal, setShowBookmarkModal] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [bookmarkLabel, setBookmarkLabel] = useState("");
  
  const { 
    annotations: notes, 
    isLoading: isLoadingNotes,
    addAnnotation: addNote,
    updateAnnotation: updateNote,
    deleteAnnotation: deleteNote
  } = useAnnotations(selectedDate);
  
  const {
    bookmarks,
    isLoading: isLoadingBookmarks,
    addBookmark,
    deleteBookmark
  } = useBookmarks(selectedDate);
  
  // Add a new note
  const handleAddNote = () => {
    if (!currentClip || !noteText.trim()) return;
    
    addNote.mutate({
      videoTime: formatVideoTime(currentVideoTime),
      clipTime: currentClip.startTime,
      date: selectedDate,
      content: noteText.trim()
    }, {
      onSuccess: () => {
        setNoteText("");
        setShowNoteModal(false);
      }
    });
  };
  
  // Add a new bookmark
  const handleAddBookmark = () => {
    if (!currentClip || !bookmarkLabel.trim()) return;
    
    addBookmark.mutate({
      videoTime: formatVideoTime(currentVideoTime),
      clipTime: currentClip.startTime,
      date: selectedDate,
      label: bookmarkLabel.trim()
    }, {
      onSuccess: () => {
        setBookmarkLabel("");
        setShowBookmarkModal(false);
      }
    });
  };
  
  // Edit an existing note
  const handleEditNote = (id: number, currentContent: string) => {
    const newContent = prompt("Update note:", currentContent);
    
    if (newContent && newContent !== currentContent) {
      updateNote.mutate({
        id,
        content: newContent
      });
    }
  };
  
  // Delete a note
  const handleDeleteNote = (id: number) => {
    if (confirm("Are you sure you want to delete this note?")) {
      deleteNote.mutate(id);
    }
  };
  
  // Delete a bookmark
  const handleDeleteBookmark = (id: number) => {
    if (confirm("Are you sure you want to delete this bookmark?")) {
      deleteBookmark.mutate(id);
    }
  };
  
  // Calculate current time display for note form
  const currentTimeDisplay = currentClip 
    ? `${currentClip.startTime} (${formatVideoTime(currentVideoTime)})`
    : "--:--";
  
  return (
    <>
      <div className="sidebar w-full md:w-80 bg-[#FFFFFF] rounded-lg shadow-lg h-[calc(100vh-240px)] md:h-auto flex flex-col border border-[#BCBBBB]">
        <Tabs defaultValue="notes" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 border-b rounded-none">
            <TabsTrigger value="notes" className="data-[state=active]:text-[#FBBC05] data-[state=active]:border-b-2 data-[state=active]:border-[#FBBC05]">
              Notes
            </TabsTrigger>
            <TabsTrigger value="bookmarks" className="data-[state=active]:text-[#FBBC05] data-[state=active]:border-b-2 data-[state=active]:border-[#FBBC05]">
              Bookmarks
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="notes" className="flex-grow flex flex-col">
            <ScrollArea className="flex-grow p-4">
              {isLoadingNotes ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FBBC05]"></div>
                </div>
              ) : notes.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-[#BCBBBB]">
                  <AlertCircle className="h-12 w-12 mb-2" />
                  <p>No notes for this date</p>
                </div>
              ) : (
                notes.map((note) => (
                  <div 
                    key={note.id}
                    className="note-item p-3 border-b border-[#BCBBBB] cursor-pointer hover:bg-[#FBBC05]/10"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-mono text-xs text-[#555555] font-bold">{note.clipTime}</span>
                      <div className="flex space-x-1">
                        <button 
                          className="text-[#BCBBBB] hover:text-[#555555]"
                          onClick={() => handleEditNote(note.id, note.content)}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          className="text-[#BCBBBB] hover:text-[#555555]"
                          onClick={() => handleDeleteNote(note.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-[#555555]">{note.content}</p>
                  </div>
                ))
              )}
            </ScrollArea>
            
            <div className="p-4 border-t border-[#BCBBBB]">
              <Button
                onClick={() => setShowNoteModal(true)}
                className="w-full bg-[#FBBC05] hover:bg-[#FBBC05]/90 text-[#000000]"
                disabled={!currentClip}
              >
                Add Note
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="bookmarks" className="flex-grow flex flex-col">
            <ScrollArea className="flex-grow p-4">
              {isLoadingBookmarks ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FBBC05]"></div>
                </div>
              ) : bookmarks.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-[#BCBBBB]">
                  <AlertCircle className="h-12 w-12 mb-2" />
                  <p>No bookmarks for this date</p>
                </div>
              ) : (
                bookmarks.map((bookmark) => (
                  <div 
                    key={bookmark.id}
                    className="bookmark-item p-3 border-b border-[#BCBBBB] cursor-pointer hover:bg-[#FBBC05]/10"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-mono text-xs text-[#555555] font-bold">{bookmark.clipTime}</span>
                      <button 
                        className="text-[#BCBBBB] hover:text-[#555555]"
                        onClick={() => handleDeleteBookmark(bookmark.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-sm font-medium text-[#555555]">{bookmark.label}</p>
                  </div>
                ))
              )}
            </ScrollArea>
            
            <div className="p-4 border-t border-[#BCBBBB]">
              <Button
                onClick={() => setShowBookmarkModal(true)}
                className="w-full bg-[#FBBC05] hover:bg-[#FBBC05]/90 text-[#000000]"
                disabled={!currentClip}
              >
                Add Bookmark
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Note Modal */}
      <Dialog open={showNoteModal} onOpenChange={setShowNoteModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#555555]">Add Note</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <div className="mb-2">
              <span className="text-sm font-mono text-[#555555]">
                Time: <span className="text-[#FBBC05] font-bold">{currentTimeDisplay}</span>
              </span>
            </div>
            <Textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Enter your note here..."
              className="w-full mb-4 text-sm border-[#BCBBBB] focus:border-[#FBBC05] focus:ring-[#FBBC05]"
              rows={4}
            />
          </div>
          <DialogFooter className="sm:justify-between">
            <Button
              variant="outline"
              className="border-[#BCBBBB] text-[#555555] hover:bg-[#BCBBBB]/10"
              onClick={() => setShowNoteModal(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-[#FBBC05] hover:bg-[#FBBC05]/90 text-[#000000]"
              onClick={handleAddNote}
              disabled={!noteText.trim() || !currentClip}
            >
              Save Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bookmark Modal */}
      <Dialog open={showBookmarkModal} onOpenChange={setShowBookmarkModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#555555]">Add Bookmark</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <div className="mb-2">
              <span className="text-sm font-mono text-[#555555]">
                Time: <span className="text-[#FBBC05] font-bold">{currentTimeDisplay}</span>
              </span>
            </div>
            <Input
              value={bookmarkLabel}
              onChange={(e) => setBookmarkLabel(e.target.value)}
              placeholder="Enter bookmark label..."
              className="w-full mb-4 text-sm border-[#BCBBBB] focus:border-[#FBBC05] focus:ring-[#FBBC05]"
            />
          </div>
          <DialogFooter className="sm:justify-between">
            <Button
              variant="outline"
              className="border-[#BCBBBB] text-[#555555] hover:bg-[#BCBBBB]/10"
              onClick={() => setShowBookmarkModal(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-[#FBBC05] hover:bg-[#FBBC05]/90 text-[#000000]"
              onClick={handleAddBookmark}
              disabled={!bookmarkLabel.trim() || !currentClip}
            >
              Save Bookmark
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}