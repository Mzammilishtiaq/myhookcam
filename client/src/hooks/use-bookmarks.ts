import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Bookmark, InsertBookmark } from "@shared/schema";

export function useBookmarks(date: string) {
  const queryClient = useQueryClient();
  
  // Fetch bookmarks
  const {
    data: bookmarks = [],
    isLoading,
    isError
  } = useQuery<Bookmark[]>({
    queryKey: ['/api/bookmarks', date],
    queryFn: async () => {
      const response = await fetch(`/api/bookmarks?date=${date}`);
      if (!response.ok) throw new Error('Failed to fetch bookmarks');
      return response.json();
    }
  });
  
  // Add bookmark
  const addBookmark = useMutation({
    mutationFn: async (newBookmark: InsertBookmark) => {
      const response = await apiRequest('POST', '/api/bookmarks', newBookmark);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bookmarks', date] });
    }
  });
  
  // Update bookmark
  const updateBookmark = useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & Partial<InsertBookmark>) => {
      const response = await apiRequest('PATCH', `/api/bookmarks/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bookmarks', date] });
    }
  });
  
  // Delete bookmark
  const deleteBookmark = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/bookmarks/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bookmarks', date] });
    }
  });
  
  return {
    bookmarks,
    isLoading,
    isError,
    addBookmark,
    updateBookmark,
    deleteBookmark
  };
}
