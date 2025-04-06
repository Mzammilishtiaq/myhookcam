import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, Activity, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

// Define the camera type
interface Camera {
  id: number;
  name: string;
  status: "online" | "offline";
  lastOnline: string;
  runningTime?: string;
  type: string;
  location: string;
}

interface CameraDashboardProps {
  jobsiteId?: string;
}

export default function CameraDashboard({ jobsiteId: propJobsiteId }: CameraDashboardProps) {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [jobsiteName, setJobsiteName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [viewType, setViewType] = useState<"grid" | "list">("grid");
  const [currentPath, navigate] = useLocation();
  
  // Get jobsiteId from URL if not provided via props
  const urlJobsiteId = currentPath.includes('/cameras/') 
    ? currentPath.split('/cameras/')[1] 
    : null;
  
  // Use prop value or URL value
  const jobsiteId = propJobsiteId || urlJobsiteId;

  useEffect(() => {
    async function fetchCameras() {
      setIsLoading(true);
      try {
        // Fetch devices (cameras)
        const response = await fetch("/api/devices");
        const devices = await response.json();
        
        // Fetch device status
        const statusResponse = await fetch("/api/device-status?date=" + new Date().toISOString().split('T')[0]);
        const deviceStatus = await statusResponse.json();
        
        // Fetch device runtime
        const runtimeResponse = await fetch("/api/device-runtime?date=" + new Date().toISOString().split('T')[0]);
        const deviceRuntime = await runtimeResponse.json();
        
        // Process data
        const processedCameras = devices
          // Filter by jobsite if needed and only include devices of type "camera"
          .filter((device: any) => 
            (device.type === "camera" || device.name.includes("HookCam")) && 
            (!jobsiteId || device.jobsiteId === parseInt(jobsiteId, 10))
          )
          .map((device: any) => {
            // Find status for this device
            const status = deviceStatus.find((s: any) => s.deviceId === device.id);
            
            // Find runtime for this device
            const runtime = deviceRuntime.find((r: any) => r.deviceId === device.id);
            
            // Set jobsite name if we have a filtered result
            if (jobsiteId && device.jobsiteName) {
              setJobsiteName(device.jobsiteName);
            }
            
            return {
              id: device.id,
              name: device.name,
              status: status?.status === 'online' ? "online" : "offline",
              lastOnline: status?.timestamp || new Date().toISOString(),
              runningTime: runtime?.runtimeMinutes ? `${Math.floor(runtime.runtimeMinutes / 60)}:${runtime.runtimeMinutes % 60}` : undefined,
              type: device.type,
              location: device.location
            };
          });
        
        setCameras(processedCameras);
      } catch (error) {
        console.error("Error fetching camera data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchCameras();
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchCameras, 30000);
    return () => clearInterval(interval);
  }, [jobsiteId]);

  // Format the runtime duration
  const formatRuntime = (runtime?: string) => {
    if (!runtime) return "N/A";
    
    const [hours, minutes] = runtime.split(":").map(Number);
    
    if (hours >= 24) {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      return `${days}d ${remainingHours}h ${minutes}m`;
    }
    
    return `${hours}h ${minutes}m`;
  };
  
  // Format time since last online
  const formatLastOnline = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return "Unknown";
    }
  };

  // Navigate to the camera view with all 3 tabs (Live Stream, Recordings, Device Status)
  const handleViewCamera = (cameraId: number) => {
    // This will navigate to the live stream tab with the specific camera selected
    // We'll use context or URL params to pass the camera ID
    // First, we'll update the selected camera in localStorage to maintain selection across tabs
    try {
      // Store the selected camera ID and the current jobsite ID if available
      const selectionData = {
        selectedCameras: [cameraId],
        selectedJobsites: jobsiteId ? [parseInt(jobsiteId, 10)] : []
      };
      localStorage.setItem('cameraSelection', JSON.stringify(selectionData));
    } catch (error) {
      console.error("Error saving camera selection:", error);
    }

    // Navigate to the Live Stream tab (the main tab view)
    navigate("/livestream");
  };

  return (
    <div className="container p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#555555]">
            {jobsiteName ? jobsiteName : "All Jobsites"} 
            <span className="text-[#FBBC05]"> Camera Dashboard</span>
          </h1>
          <p className="text-[#555555] mt-1">
            Monitoring {cameras.length} camera{cameras.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant={viewType === "grid" ? "default" : "outline"} 
            onClick={() => setViewType("grid")}
            className={viewType === "grid" ? "bg-[#FBBC05] hover:bg-[#FBBC05]/90" : ""}
          >
            Grid View
          </Button>
          <Button 
            variant={viewType === "list" ? "default" : "outline"} 
            onClick={() => setViewType("list")}
            className={viewType === "list" ? "bg-[#FBBC05] hover:bg-[#FBBC05]/90" : ""}
          >
            List View
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="grid place-items-center h-64">
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 border-4 border-[#FBBC05] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[#555555]">Loading cameras...</p>
          </div>
        </div>
      ) : cameras.length === 0 ? (
        <Card className="border-[#BCBBBB] shadow-sm">
          <CardContent className="py-10">
            <div className="text-center">
              <Camera className="mx-auto h-12 w-12 text-[#BCBBBB] mb-4" />
              <h3 className="text-xl font-medium text-[#555555] mb-2">No Cameras Found</h3>
              <p className="text-[#555555]">
                {jobsiteName 
                  ? `There are no cameras registered for ${jobsiteName}.` 
                  : "There are no cameras registered in the system."}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : viewType === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cameras.map((camera) => (
            <Card key={camera.id} className="border-[#BCBBBB] shadow-sm overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <CardTitle className="text-lg text-[#555555]">
                      {camera.name}
                    </CardTitle>
                    <p className="text-sm text-[#555555] mt-1">{camera.location}</p>
                  </div>
                  <Badge 
                    className={camera.status === "online" 
                      ? "bg-green-100 text-green-800 border border-green-200" 
                      : "bg-gray-100 text-gray-800 border border-gray-200"
                    }
                  >
                    <div className="flex items-center gap-1.5">
                      <div 
                        className={`w-2 h-2 rounded-full ${
                          camera.status === "online" ? "bg-green-500" : "bg-gray-500"
                        }`}
                      />
                      {camera.status === "online" ? "Online" : "Offline"}
                    </div>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mt-2">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-[#555555]" />
                    <span className="text-sm text-[#555555]">
                      {camera.status === "online" ? "Active" : "Last seen"}:
                    </span>
                  </div>
                  <span className="text-sm font-medium text-[#555555]">
                    {camera.status === "online" 
                      ? "Now" 
                      : formatLastOnline(camera.lastOnline)
                    }
                  </span>
                </div>
                
                <div className="flex justify-between items-center mt-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[#555555]" />
                    <span className="text-sm text-[#555555]">
                      {camera.status === "online" ? "Running time:" : "Total runtime:"}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-[#555555]">
                    {formatRuntime(camera.runningTime)}
                  </span>
                </div>
                
                <Button 
                  className="w-full mt-4 bg-[#FBBC05] hover:bg-[#FBBC05]/90 text-white"
                  onClick={() => handleViewCamera(camera.id)}
                >
                  View Camera
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-[#BCBBBB] shadow-sm">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-[#F5F5F5]">
                <TableRow>
                  <TableHead className="w-[50px] text-[#555555]">Status</TableHead>
                  <TableHead className="text-[#555555]">Camera Name</TableHead>
                  <TableHead className="text-[#555555]">Location</TableHead>
                  <TableHead className="text-[#555555]">
                    {cameras.some(cam => cam.status === "online") 
                      ? "Running Time" 
                      : "Last Online"}
                  </TableHead>
                  <TableHead className="text-right text-[#555555]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cameras.map((camera) => (
                  <TableRow key={camera.id} className="hover:bg-[#F9F9F9]">
                    <TableCell>
                      <div 
                        className={`w-3 h-3 rounded-full ${
                          camera.status === "online" ? "bg-green-500" : "bg-gray-400"
                        }`}
                      />
                    </TableCell>
                    <TableCell className="font-medium text-[#555555]">
                      {camera.name}
                    </TableCell>
                    <TableCell className="text-[#555555]">{camera.location}</TableCell>
                    <TableCell className="text-[#555555]">
                      {camera.status === "online" 
                        ? formatRuntime(camera.runningTime)
                        : formatLastOnline(camera.lastOnline)
                      }
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        size="sm"
                        className="bg-[#FBBC05] hover:bg-[#FBBC05]/90 text-white"
                        onClick={() => handleViewCamera(camera.id)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
    </div>
  );
}