import React, { useContext, useState } from 'react'
import { Button } from '../ui/button';
import { Camera, ChevronDown, ChevronRight, LayoutDashboard, MapPin, Plus, Settings, User, X } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { Input } from '../ui/input';
import { useNavigate } from 'react-router-dom';
import { PageTitleContext } from "@/context/SelectionContext";

interface SidebarProps {
  onSelectionChange: (selectedJobsites: number[], selectedCameras: number[]) => void;
}
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

function SidebaJob({ onSelectionChange }: SidebarProps) {
  const navigate = useNavigate();
  // Get the page title context
  const pageTitleContext = useContext(PageTitleContext);

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
  const toggleJobsite = (jobsiteId: number) => {
    setJobsites(jobsites.map(site =>
      site.id === jobsiteId
        ? { ...site, isExpanded: !site.isExpanded }
        : site
    ));
  };
  const areAllCamerasSelected = (jobsiteId: number) => {
    const jobsite = jobsites.find(site => site.id === jobsiteId);
    return jobsite?.cameras.every(cam => cam.isActive) ?? false;
  };

  // Check if any camera in a jobsite is selected
  const isAnyJobsiteCameraSelected = (jobsiteId: number) => {
    const jobsite = jobsites.find(site => site.id === jobsiteId);
    return jobsite?.cameras.some(cam => cam.isActive) ?? false;
  };
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
  }
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

  return (
    <div>
      <div className="p-4 pb-2">
        <div className="space-y-1 mb-4">
          <Button
            variant="ghost"
            className="w-full justify-start text-sm font-medium hover:bg-gray-100"
            onClick={() => navigate("admin-dashboard")}
          >
            <LayoutDashboard className="h-4 w-4 mr-2 text-[#FBBC05]" />
            Dashboard
          </Button>
          {/* {(userRole === "super_admin" || userRole === "manager") && ( */}
          <>
            <Button
              variant="ghost"
              className="w-full justify-start text-sm font-medium hover:bg-gray-100"
              onClick={() => navigate("users")}
            >
              <User className="h-4 w-4 mr-2 text-[#FBBC05]" />
              User Management
            </Button>
          </>
          {/* )} */}
        </div>
        <div className="p-4 pb-2">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Jobsites</h3>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => navigate("jobsite/create")}
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
                  <span
                    className="flex-grow font-medium text-sm cursor-pointer hover:text-[#FBBC05] transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Update context with jobsite name
                      if (pageTitleContext) {
                        pageTitleContext.setJobsiteName(jobsite.name);
                        pageTitleContext.setCameraName(""); // Reset camera name
                        pageTitleContext.setPageTitle("Dashboard");
                      }
                      navigate(`camera/list`);
                    }}
                  >
                    {jobsite.name}
                  </span>
                  {/* {(userRole === "super_admin" || userRole === "manager") && ( */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-gray-400 hover:text-[#FBBC05]"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Navigate to jobsite settings
                      navigate("jobsite/setting");
                    }}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                  {/* // )} */}
                  {/* <div className={`h-4 w-4 rounded border ${areAllCamerasSelected(jobsite.id)
                    ? 'bg-[#FBBC05] border-[#FBBC05]'
                    : isAnyJobsiteCameraSelected(jobsite.id)
                      ? 'bg-gray-300 border-gray-400'
                      : 'border-gray-400'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      selectAllCameras(jobsite.id, !areAllCamerasSelected(jobsite.id));
                    }}
                  /> */}
                  </div>

                {jobsite.isExpanded && (
                  <div className="ml-8 space-y-1 mt-1 pl-2 border-l border-gray-200">
                    {jobsite.cameras.map(camera => (
                      <div
                        key={camera.id}
                        className="flex items-center space-x-2 p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                      >
                        <Camera className="h-4 w-4 text-gray-500" />
                        <span
                          className="flex-grow text-sm cursor-pointer hover:text-[#FBBC05] transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();

                            // Important: Save the device ID (not camera ID) to localStorage
                            try {
                              localStorage.setItem('cameraSelection', JSON.stringify({
                                selectedCameras: [camera.deviceId], // Use deviceId instead of camera.id
                                selectedJobsites: [jobsite.id]
                              }));

                              // Clear any existing camera info from session storage
                              sessionStorage.removeItem('currentCameraInfo');

                              // Update the page title context
                              if (pageTitleContext) {
                                pageTitleContext.setCameraName(camera.name);
                                pageTitleContext.setJobsiteName(jobsite.name);
                                // Format the title as "Camera Name at Jobsite Name"
                                pageTitleContext.setPageTitle(`${camera.name} at ${jobsite.name}`);

                                // Save current camera info to session storage
                                const cameraData = {
                                  name: camera.name,
                                  location: "",  // We don't have location in the Camera type
                                  jobsiteName: jobsite.name
                                };
                                sessionStorage.setItem('currentCameraInfo', JSON.stringify(cameraData));

                                // Dispatch a custom event to notify App.tsx to update its state
                                const titleUpdateEvent = new CustomEvent('titleUpdate', {
                                  detail: {
                                    cameraName: camera.name,
                                    jobsiteName: jobsite.name,
                                    pageTitle: `${camera.name} at ${jobsite.name}`
                                  }
                                });
                                window.dispatchEvent(titleUpdateEvent);

                                // Debug log
                                console.log(`SETTING TITLE: ${camera.name} at ${jobsite.name}`);
                              }
                            } catch (error) {
                              console.error("Error saving camera selection:", error);
                            }

                            // Navigate to livestream
                            navigate(`camera/livestream`);
                          }}
                        >
                          {camera.name}
                        </span>
                        {/* {(userRole === "super_admin" ||
                        userRole === "manager") && ( */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-gray-400 hover:text-[#FBBC05]"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Logic to open settings
                            navigate("camera/setting");
                          }}
                        >
                          <Settings className="h-3 w-3" />
                        </Button>
                        {/* )} */}
                        {/* <div
                          className={`h-4 w-4 rounded border ${camera.isActive
                            ? 'bg-[#FBBC05] border-[#FBBC05]'
                            : 'border-gray-400'
                            }`}
                          onClick={() => toggleCamera(jobsite.id, camera.id)}
                        /> */}
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
                        onClick={() => navigate("camera/create")}
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
      </div>
    </div>
  )
}

export default SidebaJob