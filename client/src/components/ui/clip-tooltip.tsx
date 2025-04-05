import React from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { VideoPreview } from "@/components/ui/video-preview";
import { Clip } from "@shared/schema";
import { formatTime } from "@/lib/time";

interface ClipTooltipProps {
  clip: Clip;
  children: React.ReactNode;
}

export function ClipTooltip({ clip, children }: ClipTooltipProps) {
  const startTime = clip.startTime;
  const endTime = clip.endTime;
  
  // Calculate duration (5 minutes = 300 seconds by default)
  const startParts = startTime.split(':').map(Number);
  const endParts = endTime.split(':').map(Number);
  
  const startSeconds = startParts[0] * 3600 + startParts[1] * 60 + (startParts[2] || 0);
  const endSeconds = endParts[0] * 3600 + endParts[1] * 60 + (endParts[2] || 0);
  
  const durationInSeconds = endSeconds - startSeconds > 0 ? endSeconds - startSeconds : 300;
  const duration = formatTime(durationInSeconds);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {children}
      </TooltipTrigger>
      <TooltipContent 
        side="top" 
        align="center" 
        className="p-1 bg-[#333333] border-[#555555] shadow-xl"
        sideOffset={5}
      >
        <div className="w-[180px]">
          <div className="relative aspect-video w-full overflow-hidden rounded-sm border border-[#FBBC05]/40">
            <VideoPreview clipKey={clip.key} className="w-full h-full object-cover" />
          </div>
          <div className="mt-1 text-xs text-white">
            <div className="font-medium text-[#FBBC05]">
              {startTime} - {endTime}
            </div>
            <div className="text-[#BCBBBB] text-[10px]">
              Duration: {duration}
            </div>
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}