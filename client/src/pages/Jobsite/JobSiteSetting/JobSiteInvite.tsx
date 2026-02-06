import { useForm, Controller } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast, useToast } from "@/hooks/use-toast";
import { Clock, UserCheck, UserPlus, X } from "lucide-react";
import { useParams } from "react-router-dom";
import { backendCall } from "@/Utlis/BackendService";
import { useEffect, useState } from "react";
import { queryClient } from "@/lib/queryClient";
import { InviteUserJobsiteModule, InviteUserJobsiteModuleProps } from "@/Module/InviteUserJobsiteModule"
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
interface InviteJobsiteForm {
    email: string;
    role: "manager" | "viewer";
    permissions: {
        canViewLive: boolean;
        canViewRecordings: boolean;
        recordingDays: string;
        canPTZ: boolean;
    };
}

const fetchJobsiteUsers = async (
    jobsiteId: string,
    toast: ReturnType<typeof useToast>["toast"]
): Promise<InviteUserJobsiteModuleProps | undefined> => {
    try {
        const response: InviteUserJobsiteModuleProps = await backendCall({
            url: `/jobsites/${jobsiteId}/users`,
            method: "GET",
            dataModel: InviteUserJobsiteModule,
        });
        console.log("Invite response:", response);

        if (!response || response.status !== "success") {
            throw new Error("Failed to fetch users");
        }

        return response;
    } catch (error: any) {
        toast({
            title: "Failed to Load Users",
            description: error?.message || "An error occurred while fetching jobsite users",
            variant: "destructive",
        });
        console.error("Fetch jobsite users error:", error);
        return undefined; // safe fallback
    }
};

const inviteJobsite = async (
    jobsiteId: string,
    payload: any,
    toast: ReturnType<typeof useToast>["toast"]
) => {
    try {
        const response = await backendCall({
            url: `/jobsites/${jobsiteId}/invite`,
            method: "POST",
            data: payload,
        });

        if (!response || response.status !== "success") {
            throw new Error(response?.message || "Failed to invite user");
        }

        // Show success toast
        toast({
            title: "User Invited",
            description: "The user has been successfully invited to this jobsite",
        });

        return response;
    } catch (error: any) {
        // Show error toast
        toast({
            title: "Invite Failed",
            description: error?.message || "Failed to invite user",
            variant: "destructive",
        });

        throw error; // important for React Query onError
    }
};

const RemoveJobsiteInvitePending = async (
    jobsiteId: string,
    inviteId: string,
    toast: ReturnType<typeof useToast>["toast"]
) => {
    try {
        const response = await backendCall({
            url: `/jobsites/${jobsiteId}/invites/${inviteId}`,
            method: "DELETE",
        });

        if (response && response.status === "success") {
            toast({
                title: "Deleted",
                description: "Jobsite invite Pending has been deleted successfully",
                variant: "destructive",
            });
        }


        return response;
    } catch (error: any) {
        // Show error toast
        toast({
            title: "Delete Failed",
            description: error?.message || "Failed to delete jobsite invite Pending",
            variant: "destructive",
        });

        // VERY IMPORTANT: re-throw the error so onError is called
        throw error;
    }
};

const RemoveJobsiteInviteMember = async (
    jobsiteId: string,
    UserId: string,
    toast: ReturnType<typeof useToast>["toast"]
) => {
    try {
        const response = await backendCall({
            url: `/jobsites/${jobsiteId}/users/${UserId}`,
            method: "DELETE",
        });

        if (response && response.status === "success") {
            toast({
                title: "Deleted",
                description: "Jobsite invite Pending has been deleted successfully",
                variant: "destructive",
            });
        }
        return response;
    } catch (error: any) {
        // Show error toast
        toast({
            title: "Delete Failed",
            description: error?.message || "Failed to delete jobsite invite Pending",
            variant: "destructive",
        });
        // VERY IMPORTANT: re-throw the error so onError is called
        throw error;
    }
};
export default function JobsiteInvite() {
    const { jobsiteId } = useParams<{ jobsiteId: string }>();
    const { toast } = useToast();
    const [showDeleteSiteDialog, setShowDeleteSiteDialog] = useState(false);
    const [userToRemove, setUserToRemove] = useState<{
        type: "member" | "invite";
        id: string;
        email: string;
    } | null>(null); const [inviteUserdata, setInviteUserdata] = useState<InviteUserJobsiteModuleProps | null>(null);
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ["jobsites-users", jobsiteId],
        queryFn: () => fetchJobsiteUsers(jobsiteId!, toast),
    });
    const members = inviteUserdata?.data?.members || [];
    const invited = inviteUserdata?.data?.invited || [];

    useEffect(() => {
        if (data && data.status === "success") {
            setInviteUserdata(data);
        }
    }, [data]);

    const form = useForm<InviteJobsiteForm>({
        defaultValues: {
            email: "",
            role: "viewer",
            permissions: {
                canViewLive: false,
                canViewRecordings: false,
                recordingDays: "7",
                canPTZ: false,
            },
        },
    });

    const inviteMutation = useMutation({
        mutationFn: (data: InviteJobsiteForm) => {
            const payload =
                data.role === "viewer"
                    ? {
                        email: data.email,
                        role: data.role,
                        permissions: {
                            can_view_recordings: data.permissions.canViewRecordings,
                            can_ptz: data.permissions.canPTZ,
                            recording_limit_days: Number(data.permissions.recordingDays),
                        },
                    }
                    : {
                        email: data.email,
                        role: data.role,
                    };

            return inviteJobsite(jobsiteId!, payload, toast);
        },
        onSuccess: () => {
            form.reset();
            queryClient.invalidateQueries({ queryKey: ["jobsites-users", jobsiteId] });
            queryClient.invalidateQueries({ queryKey: ["jobsites-users"] });
            // refresh users list
        },
        onError: (error: any) => {
            console.error("Invite failed:", error);
            // Toast already shown in inviteJobsite
        },
    });
    const deletePendingMutation = useMutation({
        mutationFn: (inviteId: string) => RemoveJobsiteInvitePending(jobsiteId!, inviteId, toast),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["jobsites-users", jobsiteId] });
            queryClient.invalidateQueries({ queryKey: ["jobsites-users"] });
        },

        onError: (error: any) => {
            // Error toast already shown inside deleteJobsite, so navigation won't happen
            console.error("Delete failed:", error);
        },
    });

    const deleteMemberMutation = useMutation({
        mutationFn: (userId: string) => RemoveJobsiteInviteMember(jobsiteId!, userId, toast),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["jobsites-users", jobsiteId] });
            queryClient.invalidateQueries({ queryKey: ["jobsites-users"] });
        },

        onError: (error: any) => {
            // Error toast already shown inside deleteJobsite, so navigation won't happen
            console.error("Delete failed:", error);
        },
    });

    const onSubmit = (data: InviteJobsiteForm) => {
        inviteMutation.mutate(data);
    };

    const confirmRemoveUser = () => {
        if (!userToRemove) return;

        if (userToRemove.type === "invite") {
            deletePendingMutation.mutate(userToRemove.id);
        }

        if (userToRemove.type === "member") {
            deleteMemberMutation.mutate(userToRemove.id);
        }

        setShowDeleteSiteDialog(false);
        setUserToRemove(null);
    };

    return (
        <div className="pt-10 border-t space-y-6">
            <h4 className="text-2xl font-bold flex items-center gap-3 text-[#555555]">
                <UserPlus className="h-6 w-6 text-[#FBBC05]" />
                Invite User to this Site
            </h4>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <Label className="text-lg text-[#555555]">User Email</Label>
                            <Input
                                placeholder="user@example.com"
                                {...form.register("email", { required: true })}
                                className="h-14 text-lg rounded-none border-[#BCBBBB]"
                            />
                        </div>

                        <div className="space-y-4">
                            <Label className="text-lg text-[#555555]">Role</Label>
                            <Controller
                                name="role"
                                control={form.control}
                                render={({ field }) => (
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger className="h-14 text-lg rounded-none border-[#BCBBBB]">
                                            <SelectValue placeholder="Select a role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="manager">
                                                Site Manager
                                            </SelectItem>
                                            <SelectItem value="viewer">Viewer</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>

                        {form.watch("role") === "viewer" && (
                            <div className="space-y-6 p-6 bg-gray-50 border border-[#BCBBBB]">
                                <h5 className="font-bold text-[#555555]">
                                    Viewer Permissions
                                </h5>
                                <Controller
                                    name="permissions.canViewLive"
                                    control={form.control}
                                    render={({ field }) => (
                                        <div className="flex items-center space-x-3">
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                            <Label
                                                htmlFor="live"
                                                className="text-base font-medium cursor-pointer"
                                            >
                                                Can View Live Stream
                                            </Label>                                        </div>
                                    )}
                                />
                                <Controller
                                    name="permissions.canViewRecordings"
                                    control={form.control}
                                    render={({ field }) => (
                                        <div className="flex items-center space-x-3">
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                            <Label
                                                htmlFor="live"
                                                className="text-base font-medium cursor-pointer"
                                            >
                                                Can View Live Stream
                                            </Label>                                        </div>
                                    )}
                                />

                                {form.watch("permissions.canViewRecordings") && (
                                    <Controller
                                        name="permissions.recordingDays"
                                        control={form.control}
                                        render={({ field }) => (
                                            <Select
                                                value={field.value}
                                                onValueChange={field.onChange}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="7">7 Days</SelectItem>
                                                    <SelectItem value="30">30 Days</SelectItem>
                                                    <SelectItem value="90">90 Days</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                )}

                                <Controller
                                    name="permissions.canPTZ"
                                    control={form.control}
                                    render={({ field }) => (
                                        <div className="flex items-center space-x-3">
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                            <Label>Can PTZ</Label>
                                        </div>
                                    )}
                                />
                            </div>
                        )}

                        <Button
                            type="button"
                            onClick={form.handleSubmit(onSubmit)}
                            className="w-full h-14 text-lg bg-[#FBBC05] hover:bg-[#e5a900] rounded-none"
                            disabled={inviteMutation.isPending}
                        >
                            {inviteMutation.isPending ? "Sending Invitation..." : "Send Invitation"}
                        </Button>
                    </div>
                </form>
                <div className="space-y-4">
                    {isLoading && <p>Loading users...</p>}
                    {isError && <p>Error: {(error as Error).message}</p>}
                    <Label className="text-sm text-gray-500 uppercase font-black tracking-[0.2em]">Currently Assigned</Label>
                    <div className="space-y-3">
                        <div className="flex flex-col gap-4">
                            {/* member invitation */}
                            <div>
                                <h6 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-2">
                                    <UserCheck className="h-3 w-3" /> Joined Members
                                </h6>
                                <div className="space-y-2">
                                    {members.map(user => (
                                        <div key={user.email} className="p-4 bg-white border border-[#BCBBBB] rounded-none text-lg flex items-center justify-between group">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-[#555555]">{user.email}</span>
                                                <span className="text-sm text-[#FBBC05] font-bold uppercase tracking-wider">{user.role}</span>
                                            </div>
                                            <X
                                                className="h-6 w-6 cursor-pointer text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => {
                                                    setUserToRemove({ type: "member", id: user.id.toString(), email: user.email });
                                                    setShowDeleteSiteDialog(true);
                                                }} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {/* Pending Invitation */}
                            <div className="pt-4">
                                <h6 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-2">
                                    <Clock className="h-3 w-3" /> Pending Invitations
                                </h6>
                                <div className="space-y-2">
                                    {invited.map(user => (
                                        <div key={user.email} className="p-4 bg-gray-50/50 border border-dashed border-[#BCBBBB] rounded-none text-lg flex items-center justify-between group">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-400 italic">{user.email}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 font-bold uppercase tracking-tighter">Pending Setup</span>
                                                    <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">{user.role}</span>
                                                </div>
                                            </div>
                                            <X
                                                className="h-6 w-6 cursor-pointer text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => {
                                                    setUserToRemove({ type: "invite", id: user.id.toString(), email: user.email });
                                                    setShowDeleteSiteDialog(true);
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Dialog box pending and member */}
            <AlertDialog open={showDeleteSiteDialog} onOpenChange={setShowDeleteSiteDialog}>
                <AlertDialogContent className="rounded-none border-none shadow-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-2xl font-bold">Revoke Access?</AlertDialogTitle>
                        <AlertDialogDescription className="text-lg">
                            Are you sure you want to remove access for <span className="font-bold text-[#555555]">{userToRemove?.email}</span>?
                            They will no longer be able to view this jobsite or its cameras.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="pt-4">
                        <AlertDialogCancel className="rounded-none h-12 border-gray-200">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmRemoveUser}
                            className="rounded-none h-12 bg-red-600 hover:bg-red-700 text-white font-bold"
                        >
                            REVOKE ACCESS
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
