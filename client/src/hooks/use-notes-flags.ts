import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { NoteFlag, InsertNoteFlag } from "@shared/schema";

export function useNotesFlags(date: string) {
  const queryClient = useQueryClient();
  
  // Fetch notes & flags
  const {
    data = [],
    isLoading,
    isError
  } = useQuery<NoteFlag[]>({
    queryKey: ['/api/notes-flags', date],
    queryFn: async () => {
      const response = await fetch(`/api/notes-flags?date=${date}`);
      if (!response.ok) throw new Error('Failed to fetch notes/flags');
      return response.json();
    }
  });
  
  // Create a new note or flag
  const createNoteFlag = useMutation({
    mutationFn: async (newNoteFlag: InsertNoteFlag) => {
      const response = await apiRequest('POST', '/api/notes-flags', newNoteFlag);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notes-flags', date] });
    }
  });
  
  // Update a note or flag
  const updateNoteFlag = useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & Partial<InsertNoteFlag>) => {
      const response = await apiRequest('PATCH', `/api/notes-flags/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notes-flags', date] });
    }
  });
  
  // Delete a note or flag
  const deleteNoteFlag = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/notes-flags/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notes-flags', date] });
    }
  });
  
  // Get only the flags (bookmarks)
  const flags = data.filter(item => item.isFlag);
  
  // Get only the notes (non-flags)
  const notes = data.filter(item => !item.isFlag || (item.isFlag && item.content));
  
  return {
    notesFlags: data,
    flags,
    notes,
    isLoading,
    isError,
    createNoteFlag,
    updateNoteFlag,
    deleteNoteFlag
  };
}