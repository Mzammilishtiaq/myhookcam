import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Annotation, InsertAnnotation } from "@shared/schema";

// Renamed the hook for clarity but keeping the API endpoints the same for now
export function useAnnotations(date: string) {
  const queryClient = useQueryClient();
  
  // Fetch notes (using annotations endpoint)
  const {
    data = [],
    isLoading,
    isError
  } = useQuery<Annotation[]>({
    queryKey: ['/api/annotations', date],
    queryFn: async () => {
      const response = await fetch(`/api/annotations?date=${date}`);
      if (!response.ok) throw new Error('Failed to fetch notes');
      return response.json();
    }
  });
  
  // Create note
  const createAnnotationMutation = useMutation({
    mutationFn: async (newAnnotation: InsertAnnotation) => {
      const response = await apiRequest('POST', '/api/annotations', newAnnotation);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/annotations', date] });
    }
  });
  
  // Update note
  const updateAnnotationMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & Partial<InsertAnnotation>) => {
      const response = await apiRequest('PATCH', `/api/annotations/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/annotations', date] });
    }
  });
  
  // Delete note
  const deleteAnnotationMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/annotations/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/annotations', date] });
    }
  });
  
  // Wrapper functions to make the actual API calls
  const createAnnotation = async (newAnnotation: InsertAnnotation) => {
    return createAnnotationMutation.mutateAsync(newAnnotation);
  };
  
  const updateAnnotation = async (id: number, data: Partial<InsertAnnotation>) => {
    return updateAnnotationMutation.mutateAsync({ id, ...data });
  };
  
  const deleteAnnotation = async (id: number) => {
    return deleteAnnotationMutation.mutateAsync(id);
  };
  
  return {
    data,
    isLoading,
    isError,
    createAnnotation,
    updateAnnotation,
    deleteAnnotation
  };
}
