import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { backendCall } from "@/Utlis/BackendService";
import { UserPlus } from "lucide-react";
import React from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserProfileModule, UserProfileProps } from "@/Module/userprofile"
import { useQuery } from "@tanstack/react-query";


const fetchUserProfile = async (): Promise<UserProfileProps | null> => {
  try {
    const response: any = await backendCall({
      url: "/accounts/user/profile",
      method: "GET",
      dataModel: UserProfileModule
    })

    if (response && response.status === "success") {
      toast({
        title: "Profile Loaded",
        description: "User profile loaded successfully",
      })
      return response.data;
    } else {
      toast({
        title: "Load Failed",
        description: response?.message || "Profile load failed",
        variant: "destructive",
      })
      return null;
    }
  } catch {
    toast({
      title: "Load Failed",
      description: "Something went wrong. Please try again.",
      variant: "destructive",
    })
    return null;
  }
};

export default function GetUserProfile() {
  const navigate = useNavigate();

  const { data: data, isLoading, isError } = useQuery<UserProfileProps | null>({
    queryKey: ["user-profile"],
    queryFn: fetchUserProfile,
  });
  if (isLoading) {
    return <div className="p-6 text-lg">Loading profile...</div>
  }

  if (isError || !data) {
    return <div className="p-6 text-lg text-red-500">Failed to load profile</div>
  }

  return (
    <div className="w-full h-full min-h-[calc(100vh-140px)] py-6 px-4">
      <Card className="border-none shadow-none bg-transparent">
        <CardHeader className="px-0 pb-10">
          <CardTitle className="text-4xl font-bold flex items-center gap-3">
            <UserPlus className="h-10 w-10 text-[#FBBC05]" />
            User Profile
          </CardTitle>
          <CardDescription className="text-xl mt-2">
            Details of the user
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-2">
                <p className="text-lg font-semibold text-gray-700">First Name</p>
                <p className="text-lg">{data?.first_name}</p>
              </div>
              <div className="space-y-2">
                <p className="text-lg font-semibold text-gray-700">Last Name</p>
                <p className="text-lg">{data?.last_name}</p>
              </div>
              <div className="space-y-2">
                <p className="text-lg font-semibold text-gray-700">Email</p>
                <p className="text-lg">{data?.email}</p>
              </div>
              <div className="space-y-2">
                <p className="text-lg font-semibold text-gray-700">Phone</p>
                <p className="text-lg">{"-"}</p>
              </div>
            </div>

            <div className="flex justify-end pt-10 border-t gap-4">
              <button
                className="h-16 px-10 text-xl border border-gray-300 rounded-md hover:bg-gray-100 transition"
                onClick={() => window.history.back()}
              >
                Back
              </button>

              <Button
                type="submit"
                className="bg-[#FBBC05] hover:bg-[#e5a900] text-white h-16 px-16 text-xl font-bold"
                onClick={() => navigate("/user/profile/update")}
              >
                Update Profile
              </Button>
            </div>

          </div>
        </CardContent>
      </Card>
    </div>
  );
}