import React, { useContext, useState } from 'react'
import { Button } from '../ui/button';
import { Camera, ChevronDown, ChevronRight, LayoutDashboard, MapPin, Plus, Settings, User } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { useNavigate } from 'react-router-dom';
import { PageTitleContext } from "@/context/SelectionContext";
import { useAuthStore } from "@/hooks/authStore";
import { backendCall } from '@/Utlis/BackendService';
import { useToast } from "@/hooks/use-toast";
import { jobsiteProps, JobsiteModule } from "@/Module/jobsite";
import { useQuery } from '@tanstack/react-query';
// import { UserType } from "@/hooks/enum"
interface SidebarProps {
  onSelectionChange?: (selectedJobsites: number[], selectedCameras?: number[]) => void
}

interface CameraType {
  id: number
  name: string
  deviceId: number
  isActive: boolean
}

const getJobsites = async (toast: ReturnType<typeof useToast>["toast"]): Promise<jobsiteProps[]> => {
  try {
    const response: any = await backendCall({
      url: "/jobsites",
      method: "GET",
      dataModel: JobsiteModule,
    });

    console.log("Jobsites API response:", response);

    if (response?.status === "success") {
      toast({
        title: "Jobsites fetched successfully",
        description: `Fetched ${response.length} jobsites.`,
      });
      return response.data;
    }

    toast({
      title: "Error",
      description: response?.message || "Unable to fetch jobsites",
      variant: "destructive",
    });

    return [];
  } catch (err: any) {
    console.error("Error fetching jobsites:", err?.message || err);
    toast({
      title: "Error",
      description: err?.message || "Unable to fetch jobsites",
      variant: "destructive",
    });
    return [];
  }
};

function SidebaJob({ onSelectionChange }: SidebarProps) {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const pageTitleContext = useContext(PageTitleContext)
  const { toast } = useToast();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["/jobsites"],
    queryFn: () => getJobsites(toast), // pass toast here
  });

  return (
    <div>
      <div className="p-4 pb-2">
        <div className="space-y-1 mb-4">
          <>
            <Button
              variant="ghost"
              className="w-full justify-start text-sm font-medium hover:bg-gray-100"
              onClick={() => navigate("admin-dashboard")}
            >
              <LayoutDashboard className="h-4 w-4 mr-2 text-[#FBBC05]" />
              Dashboard
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-sm font-medium hover:bg-gray-100"
              onClick={() => navigate("user-management")}
            >
              <User className="h-4 w-4 mr-2 text-[#FBBC05]" />
              User Management
            </Button>
          </>
        </div>
        <div className="p-4 pb-2">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Jobsites</h3>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => navigate("/jobsite/create")}
            >
              <Plus className="h-4 w-4" />
            </Button>

          </div>
        </div>

        <ScrollArea className="flex-1 px-2">
          {isLoading && (
            <p className="text-sm text-gray-500 px-2">
              Loading jobsites...
            </p>
          )}

          {isError && (
            <p className="text-sm text-white bg-red-500 px-2">
              {(error as Error).message}
            </p>
          )}

          {Array.isArray(data) && data?.map((jobsite: jobsiteProps) => (
            <div key={jobsite.id} className="mb-1">
              <div
                className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  pageTitleContext?.setJobsiteName(jobsite.name)
                  pageTitleContext?.setCameraName("")
                  pageTitleContext?.setPageTitle("Dashboard")

                  onSelectionChange?.([jobsite.id])

                  navigate(`jobsites/${jobsite.id}`)
                }}
              >
                <MapPin className="h-4 w-4 text-[#FBBC05]" />

                <span className="flex-grow text-sm font-medium hover:text-[#FBBC05]">
                  {jobsite.name}
                </span>

                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 group"
                  onClick={e => {
                    e.stopPropagation()
                    navigate(`jobsites/setting/${jobsite.id}`)
                  }}
                >
                  <Settings className="h-7 w-7 transition-colors group-hover:text-[#FBBC05]" />                </Button>
              </div>
            </div>
          ))}
        </ScrollArea>
      </div>
    </div>
  )
}

export default SidebaJob