import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { findNextClip, areClipsConsecutive } from "@/lib/video";
import { fetchClips } from "@/lib/s3";
import type { Clip } from "@shared/schema";

export function useTimeline(date: string) {
  const [currentClip, setCurrentClip] = useState<Clip | undefined>(undefined);
  const [nextClip, setNextClip] = useState<Clip | undefined>(undefined);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentVideoTime, setCurrentVideoTime] = useState(0);
  
  // Fetch clips for the selected date
  const { data: clips = [] } = useQuery({
    queryKey: ['/api/clips', date],
    queryFn: () => fetchClips(date),
    onSuccess: (data) => {
      // If we have clips and no current clip is selected, select the first one
      if (data.length > 0 && !currentClip) {
        setCurrentClip(data[0]);
      }
    }
  });
  
  // Update next clip when current clip or clips list changes
  useEffect(() => {
    if (currentClip && clips.length > 0) {
      const next = findNextClip(clips, currentClip.startTime);
      setNextClip(next);
    } else {
      setNextClip(undefined);
    }
  }, [currentClip, clips]);
  
  // Reset state when date changes
  useEffect(() => {
    setCurrentClip(undefined);
    setNextClip(undefined);
    setIsPlaying(false);
    setCurrentVideoTime(0);
  }, [date]);
  
  // Handle video time update
  const handleTimeUpdate = (time: number) => {
    setCurrentVideoTime(time);
  };
  
  // Handle end of clip
  const handleClipEnded = () => {
    if (nextClip) {
      // If the next clip is consecutive, automatically play it
      if (areClipsConsecutive(currentClip, nextClip)) {
        setCurrentClip(nextClip);
        // Keep playing
      } else {
        // If not consecutive, pause at the end
        setIsPlaying(false);
      }
    } else {
      // No next clip, just pause
      setIsPlaying(false);
    }
  };
  
  return {
    currentClip,
    nextClip,
    isPlaying,
    currentVideoTime,
    setCurrentClip,
    setIsPlaying,
    handleTimeUpdate,
    handleClipEnded
  };
}
