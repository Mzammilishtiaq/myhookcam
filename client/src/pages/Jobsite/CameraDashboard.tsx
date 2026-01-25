import { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
import { PageTitleContext } from "@/context/SelectionContext";
import { LoadingAnimation } from "@/components/ui/LoadingAnimation";

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

export default function CameraDashboard({
  jobsiteId: propJobsiteId,
}: CameraDashboardProps) {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [jobsiteName, setJobsiteName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [viewType, setViewType] = useState<"grid" | "list">("grid");
  const navigate = useNavigate();
  const location = useLocation();

  // Get the page title context
  const {
    setPageTitle,
    setJobsiteName: setContextJobsiteName,
    setCameraName,
  } = useContext(PageTitleContext);

  // Get jobsiteId from URL if not provided via props
  const urlJobsiteId = location.pathname.includes("/cameras/")
    ? location.pathname.split("/cameras/")[1]
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
        const statusResponse = await fetch(
          "/api/device-status?date=" + new Date().toISOString().split("T")[0],
        );
        const deviceStatus = await statusResponse.json();

        // Fetch device runtime
        const runtimeResponse = await fetch(
          "/api/device-runtime?date=" + new Date().toISOString().split("T")[0],
        );
        const deviceRuntime = await runtimeResponse.json();

        // Process data
        const processedCameras = devices
          // Filter by jobsite if needed and only include devices of type "camera"
          .filter(
            (device: any) =>
              (device.type === "camera" || device.name.includes("HookCam")) &&
              (!jobsiteId || device.jobsiteId === parseInt(jobsiteId, 10)),
          )
          .map((device: any) => {
            // Find status for this device
            const status = deviceStatus.find(
              (s: any) => s.deviceId === device.id,
            );

            // Find runtime for this device
            const runtime = deviceRuntime.find(
              (r: any) => r.deviceId === device.id,
            );

            // Set jobsite name if we have a filtered result
            if (jobsiteId && device.jobsiteName) {
              const name = device.jobsiteName;
              setJobsiteName(name);

              // Set the context jobsite name for header display
              setContextJobsiteName(name);
              setPageTitle("Dashboard");
            }

            return {
              id: device.id,
              name: device.name,
              status: status?.status === "online" ? "online" : "offline",
              lastOnline: status?.timestamp || new Date().toISOString(),
              runningTime: runtime?.runtimeMinutes
                ? `${Math.floor(runtime.runtimeMinutes / 60)}:${runtime.runtimeMinutes % 60}`
                : undefined,
              type: device.type,
              location: device.location,
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
  }, [jobsiteId, setPageTitle, setContextJobsiteName]);

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
    // Get the camera object
    const camera = cameras.find((c) => c.id === cameraId);

    // Update the global context with camera and jobsite info
    if (camera) {
      // Set camera name in the title context
      setCameraName(camera.name);
      setPageTitle("Live Stream");
    }

    // This will navigate to the live stream tab with the specific camera selected
    // We'll use context or URL params to pass the camera ID
    // First, we'll update the selected camera in localStorage to maintain selection across tabs
    try {
      // Store the selected camera ID and the current jobsite ID if available
      const selectionData = {
        selectedCameras: [cameraId],
        selectedJobsites: jobsiteId ? [parseInt(jobsiteId, 10)] : [],
      };
      localStorage.setItem("cameraSelection", JSON.stringify(selectionData));
    } catch (error) {
      console.error("Error saving camera selection:", error);
    }

    // Navigate to the Live Stream tab (the main tab view)
    navigate("/camera/livestream");
  };

  return (
    <div className="w-full h-full min-h-[calc(100vh-140px)] py-6 px-4 bg-gray-50/50">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#555555]">
              {jobsiteName ? jobsiteName : "All Jobsites"}
              <span className="text-[#FBBC05]"> Camera Dashboard</span>
            </h1>
            <p className="text-gray-500 mt-1">
              Monitoring {cameras.length} camera
              {cameras.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={viewType === "grid" ? "default" : "outline"}
              onClick={() => setViewType("grid")}
              className={`h-12 px-6 rounded-none font-bold uppercase tracking-wider ${viewType === "grid" ? "bg-[#FBBC05] hover:bg-[#FBBC05]/90 text-white" : "bg-white border-[#BCBBBB] text-[#555555]"}`}
            >
              Grid
            </Button>
            <Button
              variant={viewType === "list" ? "default" : "outline"}
              onClick={() => setViewType("list")}
              className={`h-12 px-6 rounded-none font-bold uppercase tracking-wider ${viewType === "list" ? "bg-[#FBBC05] hover:bg-[#FBBC05]/90 text-white" : "bg-white border-[#BCBBBB] text-[#555555]"}`}
            >
              List
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingAnimation fullScreen={false} />
          </div>
        ) : cameras.length === 0 ? (
          <div className="bg-white p-12 text-center shadow-sm border-none rounded-none">
            <Camera className="mx-auto h-16 w-16 text-[#BCBBBB] mb-4" />
            <h3 className="text-2xl font-bold text-[#555555] mb-2">
              No Cameras Found
            </h3>
            <p className="text-gray-500 text-lg">
              {jobsiteName
                ? `There are no cameras registered for ${jobsiteName}.`
                : "There are no cameras registered in the system."}
            </p>
          </div>
        ) : viewType === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cameras.map((camera) => (
              <div
                key={camera.id}
                className="bg-white border-none shadow-sm overflow-hidden flex flex-col rounded-none"
              >
                <div className="p-6 pb-2">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex flex-col">
                      <h3 className="text-xl font-bold text-[#555555]">
                        {camera.name}
                      </h3>
                      <p className="text-sm font-medium text-gray-400 mt-1 uppercase tracking-wider">
                        {camera.location}
                      </p>
                    </div>
                    <div
                      className={`px-3 py-1 text-[10px] font-black uppercase tracking-[0.1em] border-2 ${
                        camera.status === "online"
                          ? "bg-green-50 text-green-600 border-green-200"
                          : "bg-gray-50 text-gray-400 border-gray-200"
                      }`}
                    >
                      {camera.status}
                    </div>
                  </div>
                </div>
                <div className="px-6 pb-6 space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-50">
                    <div className="flex items-center gap-3">
                      <Activity className="h-5 w-5 text-[#FBBC05]" />
                      <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                        {camera.status === "online" ? "Active" : "Last seen"}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-[#555555]">
                      {camera.status === "online"
                        ? "Now"
                        : formatLastOnline(camera.lastOnline)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-gray-50">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-[#FBBC05]" />
                      <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                        Runtime
                      </span>
                    </div>
                    <span className="text-sm font-bold text-[#555555]">
                      {formatRuntime(camera.runningTime)}
                    </span>
                  </div>

                  <Button
                    className="w-full mt-4 h-14 bg-[#555555] hover:bg-[#444444] text-white rounded-none font-bold uppercase tracking-widest text-base"
                    onClick={() => handleViewCamera(camera.id)}
                  >
                    View Stream
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white shadow-sm border-none rounded-none overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-[#555555] hover:bg-[#555555]">
                  <TableRow className="hover:bg-transparent h-16">
                    <TableHead className="w-[80px] text-white font-bold uppercase tracking-wider text-center">
                      Status
                    </TableHead>
                    <TableHead className="text-white font-bold uppercase tracking-wider">
                      Camera Name
                    </TableHead>
                    <TableHead className="text-white font-bold uppercase tracking-wider">
                      Location
                    </TableHead>
                    <TableHead className="text-white font-bold uppercase tracking-wider">
                      {cameras.some((cam) => cam.status === "online")
                        ? "Running Time"
                        : "Last Online"}
                    </TableHead>
                    <TableHead className="text-right text-white font-bold uppercase tracking-wider px-6">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cameras.map((camera) => (
                    <TableRow
                      key={camera.id}
                      className="hover:bg-gray-50 h-20 border-b"
                    >
                      <TableCell>
                        <div className="flex justify-center">
                          <div
                            className={`w-4 h-4 rounded-none ${
                              camera.status === "online"
                                ? "bg-green-500"
                                : "bg-gray-300"
                            }`}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="font-bold text-lg text-[#555555]">
                        {camera.name}
                      </TableCell>
                      <TableCell className="text-gray-500 font-medium">
                        {camera.location}
                      </TableCell>
                      <TableCell className="text-[#555555] font-bold">
                        {camera.status === "online"
                          ? formatRuntime(camera.runningTime)
                          : formatLastOnline(camera.lastOnline)}
                      </TableCell>
                      <TableCell className="text-right px-6">
                        <Button
                          size="lg"
                          className="h-12 px-8 bg-[#FBBC05] hover:bg-[#e5a900] text-white rounded-none font-bold uppercase tracking-wider"
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
          </div>
        )}
      </div>
    </div>
  );
}
