import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { format } from "date-fns";
import { saveAs } from "file-saver";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetchVideoBlob } from "@/lib/s3";
import type { Clip } from "@shared/schema";

interface ExportModalProps {
  clip?: Clip;
  onClose: () => void;
}

export function ExportModal({ clip, onClose }: ExportModalProps) {
  const { toast } = useToast();
  const [exportStartTime, setExportStartTime] = useState<string>(clip?.startTime || "00:00");
  const [exportEndTime, setExportEndTime] = useState<string>("00:00");
  const [exportFilename, setExportFilename] = useState<string>("");
  const [isExporting, setIsExporting] = useState(false);
  
  // Generate default filename based on clip data
  useEffect(() => {
    if (clip) {
      const startTime = clip.startTime.replace(":", "");
      let endTimeNum = parseInt(startTime.replace(":", "")) + 5;
      if (endTimeNum % 100 >= 60) {
        endTimeNum = endTimeNum + 40; // Adjust for minutes overflow
      }
      const endTime = endTimeNum.toString().padStart(4, "0");
      
      // Set default end time (start time + 5 minutes)
      const [startHour, startMinute] = clip.startTime.split(":").map(Number);
      let endHour = startHour;
      let endMinute = startMinute + 5;
      
      if (endMinute >= 60) {
        endHour = (endHour + 1) % 24;
        endMinute = endMinute % 60;
      }
      
      setExportEndTime(`${endHour.toString().padStart(2, "0")}:${endMinute.toString().padStart(2, "0")}`);
      
      // Set default filename
      const date = clip.date.replace(/-/g, "");
      setExportFilename(`Clip_${date}_${startTime}-${endTime}`);
    }
  }, [clip]);
  
  // Handle export confirmation
  const handleExport = async () => {
    if (!clip) return;
    
    setIsExporting(true);
    
    try {
      // Fetch the video blob
      const blob = await fetchVideoBlob(clip.key);
      
      // Save the file
      saveAs(blob, `${exportFilename}.mp4`);
      
      toast({
        title: "Export successful",
        description: `Clip exported as ${exportFilename}.mp4`,
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Could not export the video clip",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-[#000000] bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-[#FFFFFF] rounded-lg w-full max-w-md p-6 border-2 border-[#FBBC05]">
        <div className="flex justify-between items-center mb-4 border-b border-[#BCBBBB] pb-2">
          <h2 className="text-xl font-medium text-[#555555]">Export Clip Range</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-[#555555] hover:bg-[#FBBC05]/10"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="startTime" className="text-[#555555]">Start Time</Label>
            <Input
              id="startTime"
              type="time"
              value={exportStartTime}
              onChange={(e) => setExportStartTime(e.target.value)}
              className="border-[#BCBBBB] focus:border-[#FBBC05] focus:ring-[#FBBC05]"
            />
          </div>
          
          <div>
            <Label htmlFor="endTime" className="text-[#555555]">End Time</Label>
            <Input
              id="endTime"
              type="time"
              value={exportEndTime}
              onChange={(e) => setExportEndTime(e.target.value)}
              className="border-[#BCBBBB] focus:border-[#FBBC05] focus:ring-[#FBBC05]"
            />
          </div>
          
          <div>
            <Label htmlFor="filename" className="text-[#555555]">Filename</Label>
            <Input
              id="filename"
              type="text"
              value={exportFilename}
              onChange={(e) => setExportFilename(e.target.value)}
              className="border-[#BCBBBB] focus:border-[#FBBC05] focus:ring-[#FBBC05]"
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-2 mt-6 pt-4 border-t border-[#BCBBBB]">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-[#BCBBBB] text-[#555555] hover:bg-[#BCBBBB]/10"
          >
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting || !exportFilename.trim()}
            className="bg-[#FBBC05] hover:bg-[#FBBC05]/90 text-[#000000]"
          >
            {isExporting ? "Exporting..." : "Export"}
          </Button>
        </div>
      </div>
    </div>
  );
}
