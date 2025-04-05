import { useState } from "react";
import { FileDown, BookmarkPlus, FileEdit, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
// Removed Select imports as we simplified the export UI
import { useAnnotations } from "@/hooks/use-annotations";
import { useBookmarks } from "@/hooks/use-bookmarks";
import { formatVideoTime } from "@/lib/time";
import { ShareModal } from "@/components/ui/share-modal";
import type { Clip } from "@shared/schema";

interface ClipControlsProps {
  currentClip?: Clip;
  onExportCurrentClip: () => void;
  selectedDate: string;
}

export function ClipControls({
  currentClip,
  onExportCurrentClip,
  selectedDate
}: ClipControlsProps) {
  const { toast } = useToast();
  // Removed export format and quality state as we simplified the export UI
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  
  const { createAnnotation } = useAnnotations(selectedDate);
  const { addBookmark } = useBookmarks(selectedDate);
  
  // Handle add bookmark
  const handleAddBookmark = () => {
    if (!currentClip) {
      toast({
        title: "No clip selected",
        description: "Please select a clip to bookmark",
        variant: "destructive"
      });
      return;
    }
    
    const label = prompt("Enter a label for this bookmark:");
    
    if (label) {
      addBookmark.mutate({
        videoTime: formatVideoTime(0), // Default to start of clip
        clipTime: currentClip.startTime,
        date: selectedDate,
        label
      }, {
        onSuccess: () => {
          toast({
            title: "Bookmark added",
            description: `Bookmark created at ${currentClip.startTime}`
          });
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to create bookmark",
            variant: "destructive"
          });
        }
      });
    }
  };
  
  // Handle add annotation
  const handleAddAnnotation = async () => {
    if (!currentClip) {
      toast({
        title: "No clip selected",
        description: "Please select a clip to annotate",
        variant: "destructive"
      });
      return;
    }
    
    const content = prompt("Enter your annotation:");
    
    if (content) {
      try {
        await createAnnotation({
          videoTime: formatVideoTime(0), // Default to start of clip
          clipTime: currentClip.startTime,
          date: selectedDate,
          content
        });
        
        toast({
          title: "Note added",
          description: `Note created at ${currentClip.startTime}`
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to create note",
          variant: "destructive"
        });
      }
    }
  };
  
  // Handle share click
  const handleShareClick = () => {
    if (!currentClip) {
      toast({
        title: "No clip selected",
        description: "Please select a clip to share",
        variant: "destructive"
      });
      return;
    }
    
    setIsShareModalOpen(true);
  };
  
  return (
    <div className="clip-controls mt-8 grid grid-cols-1 gap-4 bg-[#FFFFFF] p-4 rounded-lg shadow border border-[#BCBBBB]">
      <div>
        <h3 className="text-md font-medium mb-2 text-[#555555]">Clip Controls</h3>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="default"
            className="bg-[#FBBC05] hover:bg-[#FBBC05]/90 text-[#000000]"
            onClick={onExportCurrentClip}
            disabled={!currentClip}
          >
            <FileDown className="mr-1 h-4 w-4" />
            <span>Export</span>
          </Button>
          
          <Button
            variant="outline"
            className="border-[#555555] text-[#555555] hover:bg-[#FBBC05]/10"
            onClick={handleAddBookmark}
            disabled={!currentClip}
          >
            <BookmarkPlus className="mr-1 h-4 w-4" />
            <span>Bookmark</span>
          </Button>
          
          <Button
            variant="outline"
            className="border-[#555555] text-[#555555] hover:bg-[#FBBC05]/10"
            onClick={handleAddAnnotation}
            disabled={!currentClip}
          >
            <FileEdit className="mr-1 h-4 w-4" />
            <span>Add Note</span>
          </Button>
          
          <Button
            variant="outline"
            className="border-[#555555] text-[#555555] hover:bg-[#FBBC05]/10"
            onClick={handleShareClick}
            disabled={!currentClip}
          >
            <Share2 className="mr-1 h-4 w-4" />
            <span>Share</span>
          </Button>
        </div>
      </div>
      
      {/* Share Modal */}
      {isShareModalOpen && currentClip && (
        <ShareModal
          clip={currentClip}
          onClose={() => setIsShareModalOpen(false)}
        />
      )}
    </div>
  );
}
