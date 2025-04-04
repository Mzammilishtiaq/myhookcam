import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { format, startOfWeek, endOfWeek, addDays, subDays, startOfMonth, endOfMonth } from "date-fns";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend 
} from "recharts";

// Mock data - would be replaced with real API data
const generateDeviceStatusData = (date: Date, deviceId: string) => {
  const hours = [];
  for (let hour = 0; hour < 24; hour++) {
    // Create 12 entries (5-minute increments) for each hour
    for (let increment = 0; increment < 12; increment++) {
      const minute = increment * 5;
      const timeLabel = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      // Random status (90% chance of being online)
      const status = Math.random() > 0.1 ? 'online' : 'offline';
      hours.push({
        time: timeLabel,
        status,
        deviceId
      });
    }
  }
  return hours;
};

const generateRuntimeStats = (deviceId: string) => {
  // Mock runtime data (in minutes)
  return {
    daily: Math.floor(Math.random() * 60 * 24 * 0.9), // ~90% of day
    weekly: Math.floor(Math.random() * 60 * 24 * 7 * 0.85), // ~85% of week
    monthly: Math.floor(Math.random() * 60 * 24 * 30 * 0.8) // ~80% of month
  };
};

// Convert runtime minutes to hours and minutes format
const formatRuntime = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

// Create hourly view data for visualization
const createHourlyViewData = (statusData: any[]) => {
  const hourlyData = [];
  for (let hour = 0; hour < 24; hour++) {
    const hourString = hour.toString().padStart(2, '0');
    
    // Filter data for this hour
    const hourData = statusData.filter(item => 
      item.time.startsWith(hourString)
    );
    
    // Calculate uptime percentage for this hour
    const onlineCount = hourData.filter(item => item.status === 'online').length;
    const uptimePercentage = (onlineCount / hourData.length) * 100;
    
    hourlyData.push({
      hour: `${hourString}:00`,
      uptime: uptimePercentage.toFixed(0)
    });
  }
  
  return hourlyData;
};

export default function SystemStatus() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [timeframeView, setTimeframeView] = useState<"daily" | "weekly" | "monthly">("daily");
  
  // Format date for display
  const formattedDate = format(selectedDate, "yyyy-MM-dd");
  
  // Generate mock data for the selected date
  const cameraStatusData = generateDeviceStatusData(selectedDate, "camera");
  const displayStatusData = generateDeviceStatusData(selectedDate, "display");
  
  // Generate runtime statistics
  const cameraRuntime = generateRuntimeStats("camera");
  const displayRuntime = generateRuntimeStats("display");
  
  // Create hourly view data for charts
  const cameraHourlyData = createHourlyViewData(cameraStatusData);
  const displayHourlyData = createHourlyViewData(displayStatusData);

  // Navigation functions
  const goToPreviousDay = () => setSelectedDate(subDays(selectedDate, 1));
  const goToNextDay = () => setSelectedDate(addDays(selectedDate, 1));

  // Get date range for weekly and monthly views
  const weekStart = format(startOfWeek(selectedDate), "MMM d");
  const weekEnd = format(endOfWeek(selectedDate), "MMM d, yyyy");
  const monthStart = format(startOfMonth(selectedDate), "MMM d");
  const monthEnd = format(endOfMonth(selectedDate), "MMM d, yyyy");
  
  return (
    <div className="container mx-auto p-4">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4 text-[#555555]"><span className="text-[#FBBC05]">HookCam</span> System Status</h2>
        
        {/* System Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-green-100 p-4 rounded-lg border border-green-500">
            <h3 className="font-semibold text-green-800">Storage Status</h3>
            <p className="text-green-700">Operational (87% free space)</p>
          </div>
          <div className="bg-green-100 p-4 rounded-lg border border-green-500">
            <h3 className="font-semibold text-green-800">Recording Status</h3>
            <p className="text-green-700">Recording active</p>
          </div>
          <div className="bg-green-100 p-4 rounded-lg border border-green-500">
            <h3 className="font-semibold text-green-800">Network Status</h3>
            <p className="text-green-700">Connected (150 Mbps)</p>
          </div>
          <div className="bg-green-100 p-4 rounded-lg border border-green-500">
            <h3 className="font-semibold text-green-800">System Temperature</h3>
            <p className="text-green-700">Normal (32°C)</p>
          </div>
        </div>
        
        {/* Device Health IoT Monitoring Section */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4 text-[#555555]">Device Health Monitoring</h3>
          
          {/* Timeframe Selection */}
          <div className="flex justify-between items-center mb-4">
            <div>
              <Tabs value={timeframeView} onValueChange={(v) => setTimeframeView(v as any)}>
                <TabsList>
                  <TabsTrigger value="daily">Daily</TabsTrigger>
                  <TabsTrigger value="weekly">Weekly</TabsTrigger>
                  <TabsTrigger value="monthly">Monthly</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <div className="flex items-center space-x-2">
              <button 
                className="p-1 rounded hover:bg-[#FBBC05] hover:text-[#000000]"
                onClick={goToPreviousDay}
              >
                <span className="flex items-center">◀ Previous</span>
              </button>
              
              {timeframeView === "daily" && (
                <span className="font-medium">{formattedDate}</span>
              )}
              {timeframeView === "weekly" && (
                <span className="font-medium">{weekStart} - {weekEnd}</span>
              )}
              {timeframeView === "monthly" && (
                <span className="font-medium">{monthStart} - {monthEnd}</span>
              )}
              
              <button 
                className="p-1 rounded hover:bg-[#FBBC05] hover:text-[#000000]"
                onClick={goToNextDay}
              >
                <span className="flex items-center">Next ▶</span>
              </button>
            </div>
          </div>
          
          {/* Device Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            {/* Camera Device */}
            <Card className="p-4">
              <h4 className="text-lg font-semibold mb-2">Camera (10.1.1.100)</h4>
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="bg-blue-50 p-3 rounded border border-blue-200">
                  <span className="block text-sm text-gray-500">Daily Runtime</span>
                  <span className="font-medium">{formatRuntime(cameraRuntime.daily)}</span>
                </div>
                <div className="bg-blue-50 p-3 rounded border border-blue-200">
                  <span className="block text-sm text-gray-500">Weekly Runtime</span>
                  <span className="font-medium">{formatRuntime(cameraRuntime.weekly)}</span>
                </div>
                <div className="bg-blue-50 p-3 rounded border border-blue-200">
                  <span className="block text-sm text-gray-500">Monthly Runtime</span>
                  <span className="font-medium">{formatRuntime(cameraRuntime.monthly)}</span>
                </div>
              </div>
              
              {/* Status Chart */}
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cameraHourlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="hour" 
                      tick={{fontSize: 12}}
                      interval={1}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis 
                      label={{ value: 'Uptime %', angle: -90, position: 'insideLeft' }}
                      domain={[0, 100]}
                    />
                    <Tooltip />
                    <Bar dataKey="uptime" fill="#FBBC05" name="Uptime %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
            
            {/* Display Device */}
            <Card className="p-4">
              <h4 className="text-lg font-semibold mb-2">Display (10.1.1.5)</h4>
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="bg-blue-50 p-3 rounded border border-blue-200">
                  <span className="block text-sm text-gray-500">Daily Runtime</span>
                  <span className="font-medium">{formatRuntime(displayRuntime.daily)}</span>
                </div>
                <div className="bg-blue-50 p-3 rounded border border-blue-200">
                  <span className="block text-sm text-gray-500">Weekly Runtime</span>
                  <span className="font-medium">{formatRuntime(displayRuntime.weekly)}</span>
                </div>
                <div className="bg-blue-50 p-3 rounded border border-blue-200">
                  <span className="block text-sm text-gray-500">Monthly Runtime</span>
                  <span className="font-medium">{formatRuntime(displayRuntime.monthly)}</span>
                </div>
              </div>
              
              {/* Status Chart */}
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={displayHourlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="hour" 
                      tick={{fontSize: 12}}
                      interval={1}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis 
                      label={{ value: 'Uptime %', angle: -90, position: 'insideLeft' }}
                      domain={[0, 100]}
                    />
                    <Tooltip />
                    <Bar dataKey="uptime" fill="#FBBC05" name="Uptime %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
          
          {/* Note about fake data */}
          <div className="mt-4 p-4 bg-[#FBBC05]/10 rounded-lg border border-[#FBBC05]">
            <p className="text-[#555555]">
              This view shows device uptime data in 5-minute increments. Currently displaying sample data. 
              In production, this will connect to your actual device health monitoring system.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}