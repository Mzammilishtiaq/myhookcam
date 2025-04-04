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

interface AnnotationSidebarProps {
  selectedDate: string;
  currentClip?: Clip;
  currentVideoTime: number;
}

export function AnnotationSidebar({
  selectedDate,
  currentClip,
  currentVideoTime
}: AnnotationSidebarProps) {
  const [activeTab, setActiveTab] = useState<string>("annotations");
  const [showAnnotationForm, setShowAnnotationForm] = useState(false);
  const [annotationText, setAnnotationText] = useState("");
  
  const { 
    annotations, 
    isLoading: isLoadingAnnotations,
    addAnnotation,
    updateAnnotation,
    deleteAnnotation
  } = useAnnotations(selectedDate);
  
  const {
    bookmarks,
    isLoading: isLoadingBookmarks,
    deleteBookmark
  } = useBookmarks(selectedDate);
  
  // Add a new annotation
  const handleAddAnnotation = () => {
    if (!currentClip || !annotationText.trim()) return;
    
    addAnnotation.mutate({
      videoTime: formatVideoTime(currentVideoTime),
      clipTime: currentClip.startTime,
      date: selectedDate,
      content: annotationText.trim()
    }, {
      onSuccess: () => {
        setAnnotationText("");
        setShowAnnotationForm(false);
      }
    });
  };
  
  // Edit an existing annotation
  const handleEditAnnotation = (id: number, currentContent: string) => {
    const newContent = prompt("Update annotation:", currentContent);
    
    if (newContent && newContent !== currentContent) {
      updateAnnotation.mutate({
        id,
        content: newContent
      });
    }
  };
  
  // Delete an annotation
  const handleDeleteAnnotation = (id: number) => {
    if (confirm("Are you sure you want to delete this annotation?")) {
      deleteAnnotation.mutate(id);
    }
  };
  
  // Delete a bookmark
  const handleDeleteBookmark = (id: number) => {
    if (confirm("Are you sure you want to delete this bookmark?")) {
      deleteBookmark.mutate(id);
    }
  };
  
  // Calculate current time display for annotation form
  const currentTimeDisplay = currentClip 
    ? `${currentClip.startTime} (${formatVideoTime(currentVideoTime)})`
    : "--:--";
  
  return (
    <div className="sidebar w-full md:w-80 bg-[#FFFFFF] rounded-lg shadow-lg h-[calc(100vh-140px)] md:h-auto flex flex-col border border-[#BCBBBB]">
      <Tabs defaultValue="annotations" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 border-b rounded-none">
          <TabsTrigger value="annotations" className="data-[state=active]:text-[#FBBC05] data-[state=active]:border-b-2 data-[state=active]:border-[#FBBC05]">
            Annotations
          </TabsTrigger>
          <TabsTrigger value="bookmarks" className="data-[state=active]:text-[#FBBC05] data-[state=active]:border-b-2 data-[state=active]:border-[#FBBC05]">
            Bookmarks
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="annotations" className="flex-grow flex flex-col">
          <ScrollArea className="flex-grow p-4">
            {isLoadingAnnotations ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FBBC05]"></div>
              </div>
            ) : annotations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-[#BCBBBB]">
                <AlertCircle className="h-12 w-12 mb-2" />
                <p>No annotations for this date</p>
              </div>
            ) : (
              annotations.map((annotation) => (
                <div 
                  key={annotation.id}
                  className="annotation-item p-3 border-b border-[#BCBBBB] cursor-pointer hover:bg-[#FBBC05]/10"
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-mono text-xs text-[#555555] font-bold">{annotation.clipTime}</span>
                    <div className="flex space-x-1">
                      <button 
                        className="text-[#BCBBBB] hover:text-[#555555]"
                        onClick={() => handleEditAnnotation(annotation.id, annotation.content)}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        className="text-[#BCBBBB] hover:text-[#555555]"
                        onClick={() => handleDeleteAnnotation(annotation.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-[#555555]">{annotation.content}</p>
                </div>
              ))
            )}
          </ScrollArea>
          
          {/* Annotation form */}
          {showAnnotationForm ? (
            <div className="annotation-form border-t border-[#BCBBBB] p-4">
              <h3 className="font-medium mb-2 text-[#555555]">Add Annotation</h3>
              <Textarea
                value={annotationText}
                onChange={(e) => setAnnotationText(e.target.value)}
                placeholder="Enter your note here..."
                className="w-full mb-2 text-sm border-[#BCBBBB] focus:border-[#FBBC05] focus:ring-[#FBBC05]"
                rows={3}
              />
              <div className="flex justify-between">
                <span className="text-xs font-mono self-center text-[#555555]">
                  Time: <span className="text-[#FBBC05] font-bold">{currentTimeDisplay}</span>
                </span>
                <div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mr-1 border-[#BCBBBB] text-[#555555] hover:bg-[#BCBBBB]/10"
                    onClick={() => setShowAnnotationForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="bg-[#FBBC05] hover:bg-[#FBBC05]/90 text-[#000000]"
                    onClick={handleAddAnnotation}
                    disabled={!annotationText.trim() || !currentClip}
                  >
                    Save
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 border-t border-[#BCBBBB]">
              <Button
                onClick={() => setShowAnnotationForm(true)}
                className="w-full bg-[#FBBC05] hover:bg-[#FBBC05]/90 text-[#000000]"
                disabled={!currentClip}
              >
                Add Annotation
              </Button>
            </div>
          )}
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
