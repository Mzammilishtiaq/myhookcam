import { useState } from "react";
import { format, parseISO } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { DeviceStatus, DeviceRuntime, Device } from "@shared/schema";

interface DeviceTimelineProps {
  deviceName: string;
  deviceId: number;
  timeframe: "daily" | "weekly" | "monthly";
  date: string;
  statusData: DeviceStatus[];
  runtimeData: DeviceRuntime | undefined;
}

function DeviceTimeline({ deviceName, deviceId, timeframe, date, statusData, runtimeData }: DeviceTimelineProps) {
  // Calculate uptime percentage
  const onlineCount = statusData.filter(item => item.status === "online").length;
  const uptimePercentage = statusData.length > 0 ? (onlineCount / statusData.length) * 100 : 0;
  
  // Get runtime in hours and minutes
  const getRuntimeFormatted = () => {
    if (!runtimeData) return "No data";
    
    const totalMinutes = runtimeData.runtimeMinutes;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    return `${hours}h ${minutes}m`;
  };
  
  // Get uptime percentage
  const getUptimeFormatted = () => {
    if (statusData.length === 0) return "No data";
    return `${uptimePercentage.toFixed(1)}%`;
  };
  
  return (
    <Card className="p-4 mb-4">
      <div className="flex justify-between mb-2">
        <div>
          <h3 className="font-semibold text-lg">{deviceName}</h3>
          <div className="flex space-x-4 text-sm mt-1">
            <span>Uptime: <strong className="text-yellow-500">{getUptimeFormatted()}</strong></span>
            <span>Runtime: <strong className="text-yellow-500">{getRuntimeFormatted()}</strong></span>
          </div>
        </div>
        <Badge variant={uptimePercentage > 95 ? "outline" : "destructive"}>
          {uptimePercentage > 95 ? "Healthy" : "Needs Attention"}
        </Badge>
      </div>
      
      <div className="h-8 flex mt-4 mb-1 rounded-md overflow-hidden">
        {statusData.length > 0 ? (
          statusData.map((item, index) => (
            <div 
              key={index} 
              className={`flex-1 border-r border-background last:border-r-0 ${
                item.status === 'online' ? 'bg-green-500' : 'bg-red-500'
              }`}
              title={`${item.timePoint}: ${item.status}`}
            />
          ))
        ) : (
          <div className="flex-1 bg-gray-300 text-center text-xs text-gray-600 flex items-center justify-center">
            No data available
          </div>
        )}
      </div>
      
      <div className="flex justify-between mt-1 text-xs text-gray-500">
        {timeframe === "daily" ? (
          <>
            <span>12 AM</span>
            <span>6 AM</span>
            <span>12 PM</span>
            <span>6 PM</span>
            <span>12 AM</span>
          </>
        ) : timeframe === "weekly" ? (
          <>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </>
        ) : (
          <>
            <span>Week 1</span>
            <span>Week 2</span>
            <span>Week 3</span>
            <span>Week 4</span>
          </>
        )}
      </div>
      
      {runtimeData && (
        <div className="mt-4">
          <div className="text-sm mb-1 flex justify-between">
            <span>Runtime</span>
            <span>{getRuntimeFormatted()}</span>
          </div>
          <Progress value={
            timeframe === "daily" ? 
              Math.min((runtimeData.runtimeMinutes / (24 * 60)) * 100, 100) : 
            timeframe === "weekly" ? 
              Math.min((runtimeData.runtimeMinutes / (7 * 24 * 60)) * 100, 100) : 
              Math.min((runtimeData.runtimeMinutes / (30 * 24 * 60)) * 100, 100)
          } />
        </div>
      )}
    </Card>
  );
}

export default function SystemStatus() {
  const [timeframe, setTimeframe] = useState<"daily" | "weekly" | "monthly">("daily");
  const [date, setDate] = useState<Date>(new Date());
  
  const formattedDate = format(date, "yyyy-MM-dd");
  
  // Fetch devices
  const { data: devices = [] } = useQuery<Device[]>({
    queryKey: ['/api/devices'],
    queryFn: async () => {
      const response = await fetch('/api/devices');
      if (!response.ok) throw new Error('Failed to fetch devices');
      return response.json();
    }
  });
  
  // If no devices exist, use a placeholder message
  const hasDevices = devices.length > 0;
  
  // Fetch status data for all devices
  const { data: allStatusData = [], isLoading: statusLoading } = useQuery<DeviceStatus[]>({
    queryKey: ['/api/device-status', formattedDate, timeframe],
    queryFn: async () => {
      const response = await fetch(`/api/device-status?date=${formattedDate}&timeframe=${timeframe}`);
      if (!response.ok) throw new Error('Failed to fetch device status');
      return response.json();
    }
  });
  
  // Fetch runtime data for all devices
  const { data: allRuntimeData = [], isLoading: runtimeLoading } = useQuery<DeviceRuntime[]>({
    queryKey: ['/api/device-runtime', formattedDate, timeframe],
    queryFn: async () => {
      const response = await fetch(`/api/device-runtime?date=${formattedDate}&timeframe=${timeframe}`);
      if (!response.ok) throw new Error('Failed to fetch device runtime');
      return response.json();
    }
  });
  
  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-[#555555]"><span className="text-[#FBBC05]">HookCam</span> System Health</h2>
        
        <div className="flex space-x-4 items-center">
          <div className="flex">
            <button 
              className={`px-3 py-1 rounded-l-md border border-r-0 ${
                timeframe === 'daily' 
                  ? 'bg-[#FBBC05] text-[#000000] border-[#FBBC05]' 
                  : 'bg-[#555555] text-white border-[#555555]'
              }`}
              onClick={() => setTimeframe("daily")}
            >
              Daily
            </button>
            <button 
              className={`px-3 py-1 border border-r-0 ${
                timeframe === 'weekly' 
                  ? 'bg-[#FBBC05] text-[#000000] border-[#FBBC05]' 
                  : 'bg-[#555555] text-white border-[#555555]'
              }`}
              onClick={() => setTimeframe("weekly")}
            >
              Weekly
            </button>
            <button 
              className={`px-3 py-1 rounded-r-md border ${
                timeframe === 'monthly' 
                  ? 'bg-[#FBBC05] text-[#000000] border-[#FBBC05]' 
                  : 'bg-[#555555] text-white border-[#555555]'
              }`}
              onClick={() => setTimeframe("monthly")}
            >
              Monthly
            </button>
          </div>
          
          <div className="flex items-center">
            <button 
              className="p-1 rounded hover:bg-[#FBBC05] hover:text-[#000000]"
              onClick={() => {
                const newDate = new Date(date);
                newDate.setDate(date.getDate() - (timeframe === 'daily' ? 1 : timeframe === 'weekly' ? 7 : 30));
                setDate(newDate);
              }}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <input 
              type="date" 
              className="px-2 py-1 border border-[#BCBBBB] rounded bg-[#FBBC05] text-[#000000] font-medium" 
              value={formattedDate}
              onChange={(e) => setDate(parseISO(e.target.value))}
            />
            <button 
              className="p-1 rounded hover:bg-[#FBBC05] hover:text-[#000000]"
              onClick={() => {
                const newDate = new Date(date);
                newDate.setDate(date.getDate() + (timeframe === 'daily' ? 1 : timeframe === 'weekly' ? 7 : 30));
                setDate(newDate);
              }}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      
      {/* System Overview Section */}
      <Card className="p-4 mb-6">
        <h3 className="text-lg font-semibold mb-3 text-[#555555]">System Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h4 className="font-semibold text-green-800">Storage Status</h4>
            <p className="text-green-700">Operational (87% free space)</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h4 className="font-semibold text-green-800">Recording Status</h4>
            <p className="text-green-700">Recording active</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h4 className="font-semibold text-green-800">Network Status</h4>
            <p className="text-green-700">Connected (150 Mbps)</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h4 className="font-semibold text-green-800">System Temperature</h4>
            <p className="text-green-700">Normal (32°C)</p>
          </div>
        </div>
      </Card>
      
      <div className="grid grid-cols-1 gap-4">
        {hasDevices ? (
          devices.map(device => {
            // Filter status data for this device
            const deviceStatusData = allStatusData.filter(
              status => status.deviceId === device.id
            );
            
            // Get runtime data for this device
            const deviceRuntimeData = allRuntimeData.find(
              runtime => runtime.deviceId === device.id
            );
            
            return (
              <DeviceTimeline
                key={device.id}
                deviceName={device.name}
                deviceId={device.id}
                timeframe={timeframe}
                date={formattedDate}
                statusData={deviceStatusData}
                runtimeData={deviceRuntimeData}
              />
            );
          })
        ) : statusLoading || runtimeLoading ? (
          <Card className="p-4">
            <p className="text-center py-8 text-gray-500">Loading device data...</p>
          </Card>
        ) : (
          // Demo devices if no real devices exist in the database
          [
            { id: 1, name: "Camera 1 - Front Entrance" },
            { id: 2, name: "Camera 2 - Loading Dock" },
            { id: 3, name: "Camera 3 - Parking Lot" },
            { id: 4, name: "NVR Server" },
            { id: 5, name: "Network Switch" }
          ].map(device => {
            // Get mock status data for this device
            const deviceStatusData = allStatusData.filter(
              status => status.deviceId === device.id
            );
            
            // Get mock runtime data for this device
            const deviceRuntimeData = allRuntimeData.find(
              runtime => runtime.deviceId === device.id
            );
            
            return (
              <DeviceTimeline
                key={device.id}
                deviceName={device.name}
                deviceId={device.id}
                timeframe={timeframe}
                date={formattedDate}
                statusData={deviceStatusData}
                runtimeData={deviceRuntimeData}
              />
            );
          })
        )}
      </div>
      
      {/* Note about device monitoring */}
      <div className="mt-6 p-4 bg-[#FBBC05]/10 rounded-lg border border-[#FBBC05]">
        <p className="text-[#555555]">
          This view shows device uptime data in 5-minute increments for all devices.
          In production, this will connect to your actual device health monitoring system.
          You can add new devices via the API at /api/devices.
        </p>
      </div>
    </div>
  );
}