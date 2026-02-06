import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast, useToast } from "@/hooks/use-toast";
import { MapPin, UserPlus, X, Trash2, Camera, Plus } from "lucide-react";
import JobsiteInvite from "./JobSiteInvite";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { backendCall } from "@/Utlis/BackendService"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
type FormValues = {
  name: string
};
const updateJobsite = async (
  jobsiteId: string,
  payload: { name: string }
) => {
  try {
    const response = await backendCall({
      url: `/jobsites/${jobsiteId}`,
      method: "PUT",
      data: payload,
    })

    if (!response || response.status !== "success") {
      throw response
    }

    toast({
      title: "Update Successful",
      description: response?.data.success || "Jobsite updated successfully",
    })

    return response
  } catch (error: any) {
    toast({
      title: "Update Failed",
      description:
        error?.message || "Failed to update jobsite",
      variant: "destructive",
    })

    throw error // VERY important
  }
}

const deleteJobsite = async (
  jobsiteId: string,
  toast: ReturnType<typeof useToast>["toast"]
) => {
  try {
    const response = await backendCall({
      url: `/jobsites/${jobsiteId}`,
      method: "DELETE",
    });

    if (!response || response.status !== "success") {
      // Throw an error to trigger onError
      throw new Error(response?.message || "Failed to delete jobsite");
    }

    // Success toast
    toast({
      title: "Deleted",
      description: "Jobsite has been deleted successfully",
      variant: "destructive",
    });

    return response;
  } catch (error: any) {
    // Show error toast
    toast({
      title: "Delete Failed",
      description: error?.message || "Failed to delete jobsite",
      variant: "destructive",
    });

    // VERY IMPORTANT: re-throw the error so onError is called
    throw error;
  }
};

export default function JobsiteSetting() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { jobsiteId } = useParams();
  const [showDeleteSiteDialog, setShowDeleteSiteDialog] = useState(false);
  const [userToRemove, setUserToRemove] = useState<string | null>(null);

  const confirmDeleteSite = () => {
    toast({ title: "Jobsite Deleted", variant: "destructive" });
    setShowDeleteSiteDialog(false);
  };
  const [assignedUsers, setAssignedUsers] = useState([
    { email: "manager1@example.com", role: "Site Manager", status: "joined" },
    { email: "viewer1@example.com", role: "Viewer", status: "joined" },
    { email: "pending_user@example.com", role: "Viewer", status: "pending" }
  ]);
  const confirmRemoveUser = () => {
    if (userToRemove) {
      setAssignedUsers(assignedUsers.filter(u => u.email !== userToRemove));
      toast({ title: "User Removed", description: "Access has been revoked." });
      setUserToRemove(null);
    }
  };
  const form = useForm<FormValues>({
    defaultValues: {
      name: "Downtown Construction",
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: FormValues) =>
      updateJobsite(jobsiteId!, { name: data.name }),
    onSuccess: () => {
      toast({
        title: "Updated",
        description: "Jobsite name updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/jobsites"] });
      queryClient.invalidateQueries({ queryKey: ["/jobsites", jobsiteId] }); // if you have single jobsite query  
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteJobsite(jobsiteId!, toast),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/jobsites"] });
      navigate("/admin-dashboard"); // Only navigates on success
    },

    onError: (error: any) => {
      // Error toast already shown inside deleteJobsite, so navigation won't happen
      console.error("Delete failed:", error);
    },
  });


  const onSubmit = (data: FormValues) => {
    updateMutation.mutate(data)
  }

  return (
    <div className="w-full h-full min-h-[calc(100vh-140px)] py-6 px-4 bg-gray-50/50">
      <div className="bg-white p-8 shadow-sm">
        <div className="flex flex-row items-center justify-between space-y-0 pb-10">
          <div>
            <h1 className="flex items-center gap-3 text-4xl font-bold text-[#555555]">
              <MapPin className="h-10 w-10 text-[#FBBC05]" />
              Jobsite Settings
            </h1>
            <p className="mt-2 text-xl text-gray-500">
              Update site details and manage manager access
            </p>
          </div>
          <Button
            variant="outline"
            size="lg"
            className="text-red-500 hover:text-red-700 border-red-100 h-14 px-6 text-lg rounded-none"
            onClick={() => setShowDeleteSiteDialog(true)}          >
            <Trash2 className="h-6 w-6 mr-2" />
            Delete Site
          </Button>
        </div>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
          <div className="space-y-4">
            <Label className="text-xl font-bold text-[#555555]">Jobsite Name</Label>
            <div className="flex gap-4">
              <Input
                {...form.register("name", { required: true })}
                className="h-16 text-xl max-w-2xl rounded-none border-[#BCBBBB]"
              />
              <Button
                type="button"
                onClick={form.handleSubmit(onSubmit)}
                disabled={updateMutation.isPending}
                className="h-16 px-10 text-xl bg-[#FBBC05] hover:bg-[#e5a900] rounded-none"
              >
                {updateMutation.isPending ? "Updating..." : "Update Name"}
              </Button>
            </div>
          </div>

          <div className="pt-10 border-t space-y-6">
            <h4 className="text-2xl font-bold flex items-center gap-3 text-[#555555]">
              <Camera className="h-6 w-6 text-[#FBBC05]" />
              Add New Camera to this Site
            </h4>
            <div className="flex gap-4">
              <Button
                className="h-16 px-10 text-xl bg-[#FBBC05] hover:bg-[#e5a900] rounded-none"
                onClick={() => {
                  toast({ title: "Redirecting", description: "Navigating to Camera Settings to add new device." });
                  // In a real app, this would pass the jobsite ID to the camera management page
                  window.location.href = "/cameras-admin";
                }}
              >
                <Plus className="h-6 w-6 mr-2" />
                Add Camera
              </Button>
            </div>
          </div>
          <JobsiteInvite />
        </form>
      </div>
      <AlertDialog open={showDeleteSiteDialog} onOpenChange={setShowDeleteSiteDialog}>
        <AlertDialogContent className="rounded-none border-none shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold">Delete Jobsite?</AlertDialogTitle>
            <AlertDialogDescription className="text-lg">
              This action cannot be undone. All associated camera settings, user permissions,
              and site data will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-4">
            <AlertDialogCancel className="rounded-none h-12 border-gray-200">Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteMutation.isPending}
              onClick={() => {
                deleteMutation.mutate(); // ✅ THIS triggers the API
                setShowDeleteSiteDialog(false); // close dialog
              }} className="rounded-none h-12 bg-red-600 hover:bg-red-700 text-white font-bold"
            >
              {deleteMutation.isPending ? "Deleting..." : "DELETE JOBSITE"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
