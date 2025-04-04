import { useState } from "react";
import { ChevronDown, ChevronRight, MapPin, Camera, X, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

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
    <Card className="h-full">
      <div className="p-3 border-b border-gray-200 bg-[#555555] text-white flex justify-between items-center">
        <h2 className="font-semibold">Jobsites & Cameras</h2>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-white hover:bg-[#FBBC05] hover:text-[#000000]"
          onClick={() => setIsAddingJobsite(true)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      <ScrollArea className="h-[calc(100vh-15rem)] p-2">
        {jobsites.map(jobsite => (
          <div key={jobsite.id} className="mb-2">
            <div 
              className="flex items-center space-x-2 p-2 rounded hover:bg-gray-100 cursor-pointer"
              onClick={() => toggleJobsite(jobsite.id)}
            >
              {jobsite.isExpanded 
                ? <ChevronDown className="h-4 w-4 text-gray-500" /> 
                : <ChevronRight className="h-4 w-4 text-gray-500" />
              }
              <MapPin className="h-4 w-4 text-[#FBBC05]" />
              <span className="flex-grow">{jobsite.name}</span>
              
              <Checkbox 
                checked={areAllCamerasSelected(jobsite.id)}
                indeterminate={!areAllCamerasSelected(jobsite.id) && isAnyJobsiteCameraSelected(jobsite.id)} 
                onCheckedChange={(checked) => selectAllCameras(jobsite.id, !!checked)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            
            {jobsite.isExpanded && (
              <div className="ml-8 space-y-1 mt-1">
                {jobsite.cameras.map(camera => (
                  <div 
                    key={camera.id}
                    className="flex items-center space-x-2 p-1 rounded hover:bg-gray-100"
                  >
                    <Camera className="h-4 w-4 text-gray-500" />
                    <span className="flex-grow text-sm">{camera.name}</span>
                    <Checkbox 
                      checked={camera.isActive}
                      onCheckedChange={() => toggleCamera(jobsite.id, camera.id)}
                    />
                  </div>
                ))}
                
                {isAddingCamera === jobsite.id ? (
                  <div className="flex items-center space-x-1 mt-1">
                    <Input 
                      value={newCameraName}
                      onChange={(e) => setNewCameraName(e.target.value)}
                      placeholder="Camera name"
                      className="text-sm h-7"
                    />
                    <Button 
                      size="sm" 
                      className="h-7 px-2"
                      onClick={() => addNewCamera(jobsite.id)}
                    >
                      Add
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-7 px-2"
                      onClick={() => setIsAddingCamera(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs py-1 h-6 mt-1"
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
        
        {isAddingJobsite && (
          <div className="mt-2 p-2 border rounded">
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
    </Card>
  );
}