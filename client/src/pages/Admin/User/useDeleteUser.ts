import { useMutation, useQueryClient } from "@tanstack/react-query";
import { backendCall } from "@/Utlis/BackendService";
import { useToast } from "@/hooks/use-toast";

export function useDeleteUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async (userId: string) => {
      return backendCall({
        url: `/users/${userId}`,
        method: "DELETE",
      });
    },
    onSuccess: () => {
      toast({
        title: "User deleted",
        description: "User removed successfully",
      });
      // refresh the users list
      queryClient.invalidateQueries({ queryKey: ["/users"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to delete user",
        variant: "destructive",
      });
    },
  });

  return mutation;
}