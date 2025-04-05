import { useState } from "react";
import { ChevronDown, ChevronUp, FileDown, Share2, Flag, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatTime } from "@/lib/time";
import type { Clip, NoteFlag } from "@shared/schema";
import { ShareModal } from "./share-modal";
import { NoteFlagModal } from "./note-flag-modal";
import { VideoPreview } from "./video-preview";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useNotesFlags } from "@/hooks/use-notes-flags";
import { useToast } from "@/hooks/use-toast";

interface ClipTableProps {
  clips: Clip[];
  notesFlags: NoteFlag[];
  date: string;
  onClipSelect: (clip: Clip) => void;
  createNoteFlag?: any;
  updateNoteFlag?: any;
  deleteNoteFlag?: any;
}

export function ClipTable({ 
  clips, 
  notesFlags, 
  date, 
  onClipSelect, 
  createNoteFlag,
  updateNoteFlag,
  deleteNoteFlag 
}: ClipTableProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedClipForShare, setSelectedClipForShare] = useState<Clip | null>(null);
  const [selectedClipForNotes, setSelectedClipForNotes] = useState<Clip | null>(null);
  const [editingNoteFlag, setEditingNoteFlag] = useState<NoteFlag | undefined>(undefined);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const { toast } = useToast();

  // Sort clips by start time for proper display
  const sortedClips = [...clips].sort((a, b) => {
    const aTime = a.startTime.split(':').map(Number);
    const bTime = b.startTime.split(':').map(Number);
    return (aTime[0] * 60 + aTime[1]) - (bTime[0] * 60 + bTime[1]);
  });

  // Separate notes and flags for lookup
  const clipsWithNotes = new Map<string, NoteFlag[]>();
  
  // Log all clip keys to better understand their format
  console.log('Available clips:', clips.map(clip => clip.key));
  
  // Group notes by clip time
  console.log('Grouping notes by clip time, notesFlags:', notesFlags);
  notesFlags.forEach(noteFlag => {
    // Convert clipTime to a format that matches clip.key (e.g., "14:55" to "2025-04-04_1455.mp4")
    // Extract the time portions to build a key similar to clip.key
    const [hours, minutes] = noteFlag.clipTime.split(':').map(Number);
    // Format with hours always as 2 digits and minutes always as 2 digits
    const clipKey = `${date}_${hours.toString().padStart(2, '0')}${minutes.toString().padStart(2, '0')}.mp4`;
    
    // Try alternative formats to match possible clip keys
    const altClipKey1 = `${date}_${String(hours).padStart(2, '0')}${String(minutes).padStart(2, '0')}.mp4`;
    const altClipKey2 = `${date.replace(/-/g, '')}_${String(hours).padStart(2, '0')}${String(minutes).padStart(2, '0')}.mp4`;
    
    console.log('Processing note/flag:', noteFlag, 'mapped to clipKey:', clipKey, 'or alternatives:', altClipKey1, altClipKey2);
    
    // Try to find matching clip 
    const matchingClip = clips.find(clip => 
      clip.key === clipKey || 
      clip.key === altClipKey1 || 
      clip.key === altClipKey2 ||
      clip.startTime === noteFlag.clipTime
    );
    
    if (matchingClip) {
      console.log('Found matching clip for this note:', matchingClip.key);
      if (!clipsWithNotes.has(matchingClip.key)) {
        clipsWithNotes.set(matchingClip.key, []);
      }
      clipsWithNotes.get(matchingClip.key)?.push(noteFlag);
    } else {
      console.log('No matching clip found for note/flag with time:', noteFlag.clipTime);
      
      // Add to the map using our best guess format
      if (!clipsWithNotes.has(clipKey)) {
        clipsWithNotes.set(clipKey, []);
      }
      clipsWithNotes.get(clipKey)?.push(noteFlag);
    }
  });
  
  // Find existing note for a clip
  const findExistingNote = (clipKey: string): NoteFlag | undefined => {
    const clipNotes = clipsWithNotes.get(clipKey);
    return clipNotes && clipNotes.length > 0 ? clipNotes[0] : undefined;
  };
  
  console.log('Resulting clipsWithNotes map:', 
    Array.from(clipsWithNotes.entries()).map(([key, notes]) => ({ 
      key, 
      notesCount: notes.length 
    }))
  );

  // Calculate end time from start time plus duration
  const getEndTime = (clip: Clip) => {
    const [hours, minutes] = clip.startTime.split(':').map(Number);
    let totalMinutes = hours * 60 + minutes + 5; // 5-minute clips
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  };

  const getClipNotesCount = (clipKey: string) => {
    return clipsWithNotes.get(clipKey)?.filter(nf => !nf.isFlag).length || 0;
  };

  const getClipFlagsCount = (clipKey: string) => {
    return clipsWithNotes.get(clipKey)?.filter(nf => nf.isFlag).length || 0;
  };

  // Generate and export PDF
  const generatePDF = async () => {
    try {
      setIsGeneratingPdf(true);
      const tableElement = document.getElementById('clip-table');
      
      if (!tableElement) {
        console.error("Table element not found");
        return;
      }

      // Create a clone of the table for PDF generation with expanded dimensions
      const tableClone = tableElement.cloneNode(true) as HTMLElement;
      tableClone.style.width = '100%';
      tableClone.style.maxHeight = 'none';
      
      // Create a temporary container for the clone
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.top = '-9999px';
      container.style.width = '800px';
      document.body.appendChild(container);
      container.appendChild(tableClone);

      // Set title for the report
      const titleDiv = document.createElement('div');
      titleDiv.innerHTML = `<h2 style="text-align: center; font-size: 16px; margin-bottom: 10px;">HookCam Clips Report - ${date}</h2>`;
      container.insertBefore(titleDiv, tableClone);

      // Generate PDF
      const canvas = await html2canvas(container, {
        scale: 1,
        logging: false,
        useCORS: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`HookCam_Clips_${date}.pdf`);
      
      // Clean up
      document.body.removeChild(container);
      setIsGeneratingPdf(false);
      
    } catch (error) {
      console.error("Error generating PDF:", error);
      setIsGeneratingPdf(false);
    }
  };

  const sharePDF = async () => {
    // We'll implement PDF sharing in the next phase
    // For now, we'll simply open the share modal for the PDF
    // This would work similarly to sharing a clip, but with a PDF attachment
  };

  return (
    <Card className="w-full mt-4 border-[#BCBBBB]">
      <div 
        className="flex items-center justify-between bg-[#FBBC05] p-3 cursor-pointer rounded-t-md"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="font-semibold text-[#000000] flex items-center">
          {isExpanded ? <ChevronUp className="h-5 w-5 mr-2" /> : <ChevronDown className="h-5 w-5 mr-2" />}
          Clip Details
        </h3>
        
        {isExpanded && (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              className="bg-white text-[#555555] border-[#555555] hover:bg-[#FBBC05]/10"
              onClick={(e) => {
                e.stopPropagation();
                generatePDF();
              }}
              disabled={isGeneratingPdf}
            >
              <FileDown className="h-4 w-4 mr-1" /> 
              {isGeneratingPdf ? "Generating..." : "Export PDF"}
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="bg-white text-[#555555] border-[#555555] hover:bg-[#FBBC05]/10"
              onClick={(e) => {
                e.stopPropagation();
                sharePDF();
              }}
            >
              <Share2 className="h-4 w-4 mr-1" /> Share PDF
            </Button>
          </div>
        )}
      </div>
      
      {isExpanded && (
        <div className="p-3 overflow-y-auto max-h-[300px]" id="clip-table">
          <Table>
            <TableHeader className="bg-[#F5F5F5]">
              <TableRow>
                <TableHead className="w-[50px] text-[#555555]">#</TableHead>
                <TableHead className="w-[120px] text-[#555555]">Clip</TableHead>
                <TableHead className="text-[#555555]">Start Time</TableHead>
                <TableHead className="text-[#555555]">End Time</TableHead>
                <TableHead className="text-[#555555]">Annotations</TableHead>
                <TableHead className="w-[120px] text-[#555555]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedClips.map((clip, index) => {
                const endTime = getEndTime(clip);
                const notesCount = getClipNotesCount(clip.key);
                const flagsCount = getClipFlagsCount(clip.key);
                
                return (
                  <TableRow key={clip.key} className="hover:bg-[#F9F9F9]">
                    <TableCell className="font-mono text-[#555555]">{index + 1}</TableCell>
                    <TableCell>
                      <div className="flex flex-col items-center">
                        <div 
                          className={`w-[100px] h-[60px] rounded cursor-pointer overflow-hidden mb-1 border ${
                            notesCount > 0 || flagsCount > 0 ? 'border-red-500 border-2' : 'border-[#BCBBBB]'
                          }`}
                          onClick={() => onClipSelect(clip)}
                        >
                          <VideoPreview 
                            clipKey={clip.key} 
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <span className="text-xs text-[#555555] truncate max-w-[100px]">{clip.key}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-[#555555] font-medium">{formatTime(timeToSeconds(clip.startTime))}</TableCell>
                    <TableCell className="text-[#555555]">{formatTime(timeToSeconds(endTime))}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-2">
                        {/* Notes count with badge */}
                        <div className="flex items-center gap-2">
                          {notesCount > 0 && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Badge 
                                    className="bg-blue-100 text-blue-800 border border-blue-300 hover:bg-blue-200 cursor-pointer"
                                    onClick={() => onClipSelect(clip)}
                                  >
                                    <MessageSquare className="h-3 w-3 mr-1" /> {notesCount}
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{notesCount} note{notesCount !== 1 ? 's' : ''} - Click to view</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                          
                          {flagsCount > 0 && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Badge 
                                    className="bg-red-100 text-red-800 border border-red-300 hover:bg-red-200 cursor-pointer"
                                    onClick={() => onClipSelect(clip)}
                                  >
                                    <Flag className="h-3 w-3 mr-1" /> {flagsCount}
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{flagsCount} flag{flagsCount !== 1 ? 's' : ''} - Click to view</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                        
                        {/* Notes content preview */}
                        {notesCount > 0 && (
                          <div className="text-xs text-[#555555] mt-1 max-w-[230px]">
                            {clipsWithNotes.get(clip.key)?.filter(note => note.content)
                              .slice(0, 1)
                              .map((note, i) => (
                                <div key={i} className="italic truncate">
                                  "{note.content}"
                                </div>
                              ))}
                            {(clipsWithNotes.get(clip.key)?.filter(note => note.content)?.length || 0) > 1 && (
                              <div className="text-xs text-blue-500 cursor-pointer hover:underline" onClick={() => onClipSelect(clip)}>
                                + {(clipsWithNotes.get(clip.key)?.filter(note => note.content)?.length || 0) - 1} more notes
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-8 w-8 border-[#BCBBBB]"
                          onClick={() => {
                            // Check for existing note for this clip
                            const existingNote = findExistingNote(clip.key);
                            setEditingNoteFlag(existingNote);
                            setSelectedClipForNotes(clip);
                          }}
                        >
                          <MessageSquare className="h-4 w-4 text-[#555555]" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-8 w-8 border-[#BCBBBB]"
                          onClick={() => setSelectedClipForShare(clip)}
                        >
                          <Share2 className="h-4 w-4 text-[#555555]" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
      
      {/* Share Modal */}
      {selectedClipForShare && (
        <ShareModal
          clip={selectedClipForShare}
          onClose={() => setSelectedClipForShare(null)}
        />
      )}
      
      {/* Notes/Flag Modal */}
      {selectedClipForNotes && (
        <NoteFlagModal
          clip={selectedClipForNotes}
          date={date}
          existingNote={editingNoteFlag}
          onSave={(content, isFlag) => {
            const noteData = {
              clipTime: selectedClipForNotes.startTime,
              date: date,
              content: content || null,
              isFlag,
              // This videoTime is a placeholder since we don't know the current time
              videoTime: selectedClipForNotes.startTime
            };
            
            if (editingNoteFlag) {
              // Update existing note/flag
              if (!updateNoteFlag) {
                console.error('updateNoteFlag is not available');
                toast({
                  title: "Error",
                  description: "Failed to update note/flag",
                  variant: "destructive"
                });
                setSelectedClipForNotes(null);
                setEditingNoteFlag(undefined);
                return;
              }
              
              console.log('Updating note from clip table:', { id: editingNoteFlag.id, ...noteData });
              
              updateNoteFlag.mutate({ 
                id: editingNoteFlag.id, 
                ...noteData
              }, {
                onSuccess: (data) => {
                  console.log('Successfully updated note/flag from clip table:', data);
                  toast({
                    title: isFlag ? (content ? "Note & Flag updated" : "Flag updated") : "Note updated",
                    description: `Updated for clip at ${selectedClipForNotes.startTime}`
                  });
                },
                onError: (error) => {
                  console.error('Failed to update note/flag from clip table:', error);
                  toast({
                    title: "Error",
                    description: "Failed to update note/flag",
                    variant: "destructive"
                  });
                }
              });
            } else {
              // Create new note/flag
              if (!createNoteFlag) {
                console.error('createNoteFlag is not available');
                toast({
                  title: "Error",
                  description: "Failed to save note/flag",
                  variant: "destructive"
                });
                setSelectedClipForNotes(null);
                return;
              }
              
              console.log('Creating new note from clip table:', noteData);
              
              createNoteFlag.mutate(noteData, {
                onSuccess: (data) => {
                  console.log('Successfully created note/flag from clip table:', data);
                  toast({
                    title: isFlag ? (content ? "Note & Flag added" : "Flag added") : "Note added",
                    description: `Added to clip at ${selectedClipForNotes.startTime}`
                  });
                },
                onError: (error) => {
                  console.error('Failed to create note/flag from clip table:', error);
                  toast({
                    title: "Error",
                    description: "Failed to save note/flag",
                    variant: "destructive"
                  });
                }
              });
            }
            
            setSelectedClipForNotes(null);
            setEditingNoteFlag(undefined);
          }}
          onDelete={(id) => {
            if (!deleteNoteFlag) {
              console.error('deleteNoteFlag is not available');
              toast({
                title: "Error",
                description: "Failed to delete note/flag",
                variant: "destructive"
              });
              setSelectedClipForNotes(null);
              setEditingNoteFlag(undefined);
              return;
            }
            
            console.log('Deleting note/flag with id:', id);
            
            deleteNoteFlag.mutate(id, {
              onSuccess: () => {
                console.log('Successfully deleted note/flag from clip table');
                toast({
                  title: "Deleted",
                  description: `Note/flag for clip at ${selectedClipForNotes.startTime} has been deleted`
                });
              },
              onError: (error) => {
                console.error('Failed to delete note/flag:', error);
                toast({
                  title: "Error",
                  description: "Failed to delete note/flag",
                  variant: "destructive"
                });
              }
            });
            
            setSelectedClipForNotes(null);
            setEditingNoteFlag(undefined);
          }}
          onClose={() => {
            setSelectedClipForNotes(null);
            setEditingNoteFlag(undefined);
          }}
        />
      )}
    </Card>
  );
}

// Convert time string to seconds for formatting
function timeToSeconds(timeString: string): number {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 3600 + minutes * 60;
}