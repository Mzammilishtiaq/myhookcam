import { useState } from "react";
import { FileDown, BookmarkPlus, FileEdit, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  const [exportFormat, setExportFormat] = useState<string>("mp4");
  const [exportQuality, setExportQuality] = useState<string>("high");
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  
  const { addAnnotation } = useAnnotations(selectedDate);
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
  const handleAddAnnotation = () => {
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
      addAnnotation.mutate({
        videoTime: formatVideoTime(0), // Default to start of clip
        clipTime: currentClip.startTime,
        date: selectedDate,
        content
      }, {
        onSuccess: () => {
          toast({
            title: "Annotation added",
            description: `Annotation created at ${currentClip.startTime}`
          });
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to create annotation",
            variant: "destructive"
          });
        }
      });
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
    <div className="clip-controls mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#FFFFFF] p-4 rounded-lg shadow border border-[#BCBBBB]">
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
            <span>Export Current</span>
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
      
      <div className="md:ml-auto">
        <h3 className="text-md font-medium mb-2 text-[#555555]">Export Options</h3>
        <div className="flex flex-wrap gap-2">
          <Select
            value={exportFormat}
            onValueChange={setExportFormat}
          >
            <SelectTrigger className="w-[140px] border-[#BCBBBB] text-[#555555] focus:ring-[#FBBC05]">
              <SelectValue placeholder="Format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mp4">MP4</SelectItem>
              <SelectItem value="webm">WebM</SelectItem>
              <SelectItem value="mov">MOV</SelectItem>
            </SelectContent>
          </Select>
          
          <Select
            value={exportQuality}
            onValueChange={setExportQuality}
          >
            <SelectTrigger className="w-[160px] border-[#BCBBBB] text-[#555555] focus:ring-[#FBBC05]">
              <SelectValue placeholder="Quality" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="high">High Quality</SelectItem>
              <SelectItem value="medium">Medium Quality</SelectItem>
              <SelectItem value="low">Low Quality</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="default"
            className="bg-[#555555] hover:bg-[#555555]/90 text-[#FFFFFF]"
            disabled={!currentClip}
            onClick={onExportCurrentClip}
          >
            <FileDown className="mr-1 h-4 w-4" />
            <span>Export Range</span>
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
