import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Annotation, InsertAnnotation } from "@shared/schema";

export function useAnnotations(date: string) {
  const queryClient = useQueryClient();
  
  // Fetch annotations
  const {
    data: annotations = [],
    isLoading,
    isError
  } = useQuery<Annotation[]>({
    queryKey: ['/api/annotations', date],
    queryFn: async () => {
      const response = await fetch(`/api/annotations?date=${date}`);
      if (!response.ok) throw new Error('Failed to fetch annotations');
      return response.json();
    }
  });
  
  // Add annotation
  const addAnnotation = useMutation({
    mutationFn: async (newAnnotation: InsertAnnotation) => {
      const response = await apiRequest('POST', '/api/annotations', newAnnotation);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/annotations', date] });
    }
  });
  
  // Update annotation
  const updateAnnotation = useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & Partial<InsertAnnotation>) => {
      const response = await apiRequest('PATCH', `/api/annotations/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/annotations', date] });
    }
  });
  
  // Delete annotation
  const deleteAnnotation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/annotations/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/annotations', date] });
    }
  });
  
  return {
    annotations,
    isLoading,
    isError,
    addAnnotation,
    updateAnnotation,
    deleteAnnotation
  };
}
