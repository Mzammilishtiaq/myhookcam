import { useState } from "react";
import { ChevronDown, ChevronRight, MapPin, Camera, X, Plus, User, Menu } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import useSidebarStore from "@/hooks/use-sidebar";

// Define the jobsite and camera types
interface Camera {
  id: number;
  name: string;
  deviceId: number;
  isActive: boolean;
}

interface Jobsite {
  id: number;
  name: string;
  cameras: Camera[];
  isExpanded: boolean;
}

interface SidebarProps {
  onSelectionChange: (selectedJobsites: number[], selectedCameras: number[]) => void;
}

export function Sidebar({ onSelectionChange }: SidebarProps) {
  // Get the toggle function from the sidebar store
  const { toggle } = useSidebarStore();
  
  // Sample jobsite data - in a real app this would come from an API
  const [jobsites, setJobsites] = useState<Jobsite[]>([
    {
      id: 1,
      name: "Downtown Construction",
      isExpanded: true,
      cameras: [
        { id: 1, name: "HookCam - Main Tower", deviceId: 1, isActive: true },
        { id: 2, name: "HookCam - East Wing", deviceId: 2, isActive: false }
      ]
    },
    {
      id: 2,
      name: "Harbor Project",
      isExpanded: false,
      cameras: [
        { id: 3, name: "HookCam - Pier 1", deviceId: 3, isActive: true },
        { id: 4, name: "HookCam - Loading Dock", deviceId: 4, isActive: true }
      ]
    },
    {
      id: 3,
      name: "Highway Extension",
      isExpanded: false,
      cameras: [
        { id: 5, name: "HookCam - North Section", deviceId: 5, isActive: true }
      ]
    }
  ]);

  // State for adding new jobsite/camera
  const [isAddingJobsite, setIsAddingJobsite] = useState(false);
  const [isAddingCamera, setIsAddingCamera] = useState<number | null>(null);
  const [newJobsiteName, setNewJobsiteName] = useState("");
  const [newCameraName, setNewCameraName] = useState("");
  
  // Mocked user data for demo
  const userName = "John Smith";
  
  // Handle sidebar toggle with logging
  const handleToggleSidebar = () => {
    console.log("Sidebar toggle button clicked");
    toggle();
  };

  // Toggle jobsite expansion
  const toggleJobsite = (jobsiteId: number) => {
    setJobsites(jobsites.map(site => 
      site.id === jobsiteId 
        ? { ...site, isExpanded: !site.isExpanded }
        : site
    ));
  };

  // Toggle camera selection
  const toggleCamera = (jobsiteId: number, cameraId: number) => {
    const updatedJobsites = jobsites.map(site => 
      site.id === jobsiteId 
        ? {
            ...site, 
            cameras: site.cameras.map(cam => 
              cam.id === cameraId 
                ? { ...cam, isActive: !cam.isActive }
                : cam
            )
          }
        : site
    );
    
    setJobsites(updatedJobsites);
    
    // Notify parent component of selection changes
    const selectedJobsites = updatedJobsites.map(site => site.id);
    const selectedCameras = updatedJobsites.flatMap(site => 
      site.cameras.filter(cam => cam.isActive).map(cam => cam.deviceId)
    );
    
    onSelectionChange(selectedJobsites, selectedCameras);
  };

  // Select all cameras in a jobsite
  const selectAllCameras = (jobsiteId: number, isSelected: boolean) => {
    const updatedJobsites = jobsites.map(site => 
      site.id === jobsiteId 
        ? {
            ...site, 
            cameras: site.cameras.map(cam => ({ ...cam, isActive: isSelected }))
          }
        : site
    );
    
    setJobsites(updatedJobsites);
    
    // Notify parent component of selection changes
    const selectedJobsites = updatedJobsites.map(site => site.id);
    const selectedCameras = updatedJobsites.flatMap(site => 
      site.cameras.filter(cam => cam.isActive).map(cam => cam.deviceId)
    );
    
    onSelectionChange(selectedJobsites, selectedCameras);
  };

  // Add new jobsite
  const addNewJobsite = () => {
    if (newJobsiteName.trim()) {
      const newJobsite: Jobsite = {
        id: Math.max(0, ...jobsites.map(site => site.id)) + 1,
        name: newJobsiteName.trim(),
        isExpanded: true,
        cameras: []
      };
      
      setJobsites([...jobsites, newJobsite]);
      setNewJobsiteName("");
      setIsAddingJobsite(false);
    }
  };

  // Add new camera to a jobsite
  const addNewCamera = (jobsiteId: number) => {
    if (newCameraName.trim()) {
      const updatedJobsites = jobsites.map(site => 
        site.id === jobsiteId 
          ? {
              ...site, 
              cameras: [
                ...site.cameras, 
                {
                  id: Math.max(0, ...jobsites.flatMap(s => s.cameras.map(c => c.id))) + 1,
                  name: newCameraName.trim(),
                  deviceId: Math.max(0, ...jobsites.flatMap(s => s.cameras.map(c => c.deviceId))) + 1,
                  isActive: true
                }
              ]
            }
          : site
      );
      
      setJobsites(updatedJobsites);
      setNewCameraName("");
      setIsAddingCamera(null);
    }
  };

  // Check if all cameras in a jobsite are selected
  const areAllCamerasSelected = (jobsiteId: number) => {
    const jobsite = jobsites.find(site => site.id === jobsiteId);
    return jobsite?.cameras.every(cam => cam.isActive) ?? false;
  };

  // Check if any camera in a jobsite is selected
  const isAnyJobsiteCameraSelected = (jobsiteId: number) => {
    const jobsite = jobsites.find(site => site.id === jobsiteId);
    return jobsite?.cameras.some(cam => cam.isActive) ?? false;
  };

  return (
    <Card className="h-full flex flex-col rounded-r-xl shadow-lg w-[280px]">
      {/* Customer Logo and User Section */}
      <div className="px-6 py-8 bg-[#555555] text-white rounded-tr-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="flex-shrink-0 w-12 h-12 bg-[#FBBC05] rounded-full flex items-center justify-center mr-3">
              <span className="font-bold text-lg text-white">AC</span>
            </div>
            <div>
              <div className="text-xl font-bold">
                <span className="text-[#FBBC05]">ACME</span> Construction
              </div>
              <div className="text-xs text-gray-300">powered by <span className="text-[#FBBC05]">HookCam</span></div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-white p-1 hover:bg-[#666666] transition-colors"
            onClick={handleToggleSidebar}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="flex items-center mt-4 pb-3">
          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center mr-2">
            <User className="h-4 w-4 text-gray-600" />
          </div>
          <div>
            <div className="text-sm font-medium">{userName}</div>
            <div className="text-xs text-gray-300">Project Manager</div>
          </div>
        </div>
      </div>
      
      <Separator className="bg-gray-600" />
      
      {/* Navigation Section */}
      <div className="p-4 pb-2">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Jobsites</h3>
          <Button 
            variant="ghost" 
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => setIsAddingJobsite(true)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <ScrollArea className="flex-1 px-2">
        {/* Jobsites List */}
        <div className="space-y-1 mb-4">
          {jobsites.map(jobsite => (
            <div key={jobsite.id} className="mb-3">
              <div 
                className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 cursor-pointer transition-colors"
                onClick={() => toggleJobsite(jobsite.id)}
              >
                {jobsite.isExpanded 
                  ? <ChevronDown className="h-4 w-4 text-gray-500" /> 
                  : <ChevronRight className="h-4 w-4 text-gray-500" />
                }
                <MapPin className="h-4 w-4 text-[#FBBC05]" />
                <span className="flex-grow font-medium text-sm">{jobsite.name}</span>
                
                <div 
                  className={`h-4 w-4 rounded border ${
                    areAllCamerasSelected(jobsite.id) 
                      ? 'bg-[#FBBC05] border-[#FBBC05]' 
                      : isAnyJobsiteCameraSelected(jobsite.id)
                        ? 'bg-gray-300 border-gray-400' 
                        : 'border-gray-400'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    selectAllCameras(jobsite.id, !areAllCamerasSelected(jobsite.id));
                  }}
                />
              </div>
              
              {jobsite.isExpanded && (
                <div className="ml-8 space-y-1 mt-1 pl-2 border-l border-gray-200">
                  {jobsite.cameras.map(camera => (
                    <div 
                      key={camera.id}
                      className="flex items-center space-x-2 p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                    >
                      <Camera className="h-4 w-4 text-gray-500" />
                      <span className="flex-grow text-sm">{camera.name}</span>
                      <div 
                        className={`h-4 w-4 rounded border ${
                          camera.isActive
                            ? 'bg-[#FBBC05] border-[#FBBC05]' 
                            : 'border-gray-400'
                        }`}
                        onClick={() => toggleCamera(jobsite.id, camera.id)}
                      />
                    </div>
                  ))}
                  
                  {isAddingCamera === jobsite.id ? (
                    <div className="flex items-center space-x-1 mt-1 p-1">
                      <Input 
                        value={newCameraName}
                        onChange={(e) => setNewCameraName(e.target.value)}
                        placeholder="Camera name"
                        className="text-sm h-7"
                      />
                      <Button 
                        size="sm" 
                        className="h-7 px-2 bg-[#FBBC05] hover:bg-[#FBBC05]/80"
                        onClick={() => addNewCamera(jobsite.id)}
                      >
                        Add
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-7 w-7 p-0"
                        onClick={() => setIsAddingCamera(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-xs py-1 h-6 mt-1 w-full justify-start text-gray-500"
                      onClick={() => setIsAddingCamera(jobsite.id)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Camera
                    </Button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
        
        {isAddingJobsite && (
          <div className="mt-2 p-3 border rounded-md shadow-sm bg-white">
            <h4 className="text-sm font-medium mb-2">Add New Jobsite</h4>
            <Input 
              value={newJobsiteName}
              onChange={(e) => setNewJobsiteName(e.target.value)}
              placeholder="Jobsite name"
              className="mb-2"
            />
            <div className="flex justify-end space-x-2">
              <Button 
                size="sm" 
                onClick={addNewJobsite}
                className="bg-[#FBBC05] hover:bg-[#FBBC05]/80"
              >
                Add
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setIsAddingJobsite(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </ScrollArea>
      
      <div className="p-4 mt-auto">
        <div className="text-xs text-center text-gray-400">
          © 2025 HookCam System
        </div>
      </div>
    </Card>
  );
}