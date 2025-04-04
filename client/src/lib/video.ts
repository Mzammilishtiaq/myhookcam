// Video utility functions

// Calculate the next segment time (current time + 5 minutes)
export function calculateNextSegmentTime(currentTime: string): string {
  const [hours, minutes] = currentTime.split(':').map(Number);
  
  let nextHours = hours;
  let nextMinutes = minutes + 5;
  
  if (nextMinutes >= 60) {
    nextHours = (nextHours + 1) % 24;
    nextMinutes = nextMinutes % 60;
  }
  
  return `${nextHours.toString().padStart(2, '0')}:${nextMinutes.toString().padStart(2, '0')}`;
}

// Find the next available clip from the current time
export function findNextClip(clips: any[], currentTime: string): any | undefined {
  const nextTime = calculateNextSegmentTime(currentTime);
  
  // First try to find a clip that starts exactly at the next time
  const exactNextClip = clips.find(clip => clip.startTime === nextTime);
  if (exactNextClip) return exactNextClip;
  
  // If no exact match, find the next closest clip in time
  const sortedClips = [...clips].sort((a, b) => {
    return a.startTime.localeCompare(b.startTime);
  });
  
  // Find the next clip after the current time
  return sortedClips.find(clip => clip.startTime > currentTime);
}

// Convert HH:MM time format to minutes since midnight
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

// Check if two clips are consecutive (within 5 minutes of each other)
export function areClipsConsecutive(clip1: any, clip2: any): boolean {
  if (!clip1 || !clip2) return false;
  
  const time1 = timeToMinutes(clip1.startTime);
  const time2 = timeToMinutes(clip2.startTime);
  
  return Math.abs(time2 - time1) === 5;
}
