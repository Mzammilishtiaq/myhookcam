import { useContext, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SelectionContext } from "@/App";
import { BarChart3, TrendingUp, Clock, Activity, AlertTriangle, CheckCircle, Package, Weight, Wind } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Legend, BarChart, ReferenceLine } from "recharts";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function Insights() {
  const { selectedCameras } = useContext(SelectionContext);
  const [selectedMetric, setSelectedMetric] = useState<"duration" | "tonnage">("duration");
  const [showWindSpeed, setShowWindSpeed] = useState(false);

  const pickTimeData = [
    { name: "Pick Time", value: 312, color: "#FBBC05" },
    { name: "No Pick Time", value: 210, color: "#BCBBBB" }
  ];

  const totalMinutes = pickTimeData[0].value + pickTimeData[1].value;
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  const windData = [
    { hour: 0, windSpeed: 8 },
    { hour: 1, windSpeed: 7 },
    { hour: 2, windSpeed: 6 },
    { hour: 3, windSpeed: 5 },
    { hour: 4, windSpeed: 6 },
    { hour: 5, windSpeed: 8 },
    { hour: 6, windSpeed: 10 },
    { hour: 7, windSpeed: 12 },
    { hour: 8, windSpeed: 14 },
    { hour: 9, windSpeed: 16 },
    { hour: 10, windSpeed: 18 },
    { hour: 11, windSpeed: 20 },
    { hour: 12, windSpeed: 22 },
    { hour: 13, windSpeed: 21 },
    { hour: 14, windSpeed: 19 },
    { hour: 15, windSpeed: 17 },
    { hour: 16, windSpeed: 15 },
    { hour: 17, windSpeed: 13 },
    { hour: 18, windSpeed: 11 },
    { hour: 19, windSpeed: 10 },
    { hour: 20, windSpeed: 9 },
    { hour: 21, windSpeed: 8 },
    { hour: 22, windSpeed: 7 },
    { hour: 23, windSpeed: 7 },
    { hour: 24, windSpeed: 8 },
  ];

  const pickEvents = [
    { timeStart: "6:30 AM", timeEnd: "6:38 AM", durationMinutes: 8, tonnage: 3.2, hour: 6.5 },
    { timeStart: "7:15 AM", timeEnd: "7:20 AM", durationMinutes: 5, tonnage: 2.1, hour: 7.25 },
    { timeStart: "8:00 AM", timeEnd: "8:12 AM", durationMinutes: 12, tonnage: 5.8, hour: 8.0 },
    { timeStart: "8:45 AM", timeEnd: "8:51 AM", durationMinutes: 6, tonnage: 2.5, hour: 8.75 },
    { timeStart: "9:30 AM", timeEnd: "9:40 AM", durationMinutes: 10, tonnage: 4.2, hour: 9.5 },
    { timeStart: "10:15 AM", timeEnd: "10:19 AM", durationMinutes: 4, tonnage: 1.8, hour: 10.25 },
    { timeStart: "11:00 AM", timeEnd: "11:07 AM", durationMinutes: 7, tonnage: 3.5, hour: 11.0 },
    { timeStart: "11:30 AM", timeEnd: "11:39 AM", durationMinutes: 9, tonnage: 4.0, hour: 11.5 },
    { timeStart: "1:00 PM", timeEnd: "1:11 PM", durationMinutes: 11, tonnage: 5.2, hour: 13.0 },
    { timeStart: "1:45 PM", timeEnd: "1:51 PM", durationMinutes: 6, tonnage: 2.8, hour: 13.75 },
    { timeStart: "2:30 PM", timeEnd: "2:38 PM", durationMinutes: 8, tonnage: 3.6, hour: 14.5 },
    { timeStart: "3:15 PM", timeEnd: "3:20 PM", durationMinutes: 5, tonnage: 2.2, hour: 15.25 },
    { timeStart: "4:00 PM", timeEnd: "4:10 PM", durationMinutes: 10, tonnage: 4.5, hour: 16.0 },
    { timeStart: "4:30 PM", timeEnd: "4:37 PM", durationMinutes: 7, tonnage: 3.1, hour: 16.5 },
    { timeStart: "5:15 PM", timeEnd: "5:19 PM", durationMinutes: 4, tonnage: 1.9, hour: 17.25 },
  ];

  const combinedData = pickEvents.map(pick => {
    const windEntry = windData.find(w => Math.floor(pick.hour) === w.hour) || { windSpeed: 0 };
    return {
      ...pick,
      timeLabel: pick.timeStart,
      windSpeed: windEntry.windSpeed
    };
  });

  const formatHour = (hour: number) => {
    const h = Math.floor(hour);
    return `${h}:00`;
  };

  const getYAxisLabel = () => {
    return selectedMetric === "duration" ? "Duration (min)" : "Tonnage (tons)";
  };

  const getYAxisDomain = () => {
    if (selectedMetric === "duration") {
      return [0, 15];
    }
    return [0, 7];
  };

  return (
    <div className="space-y-6" data-testid="insights-page">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-[#BCBBBB]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#555555]">Total Run Time</CardTitle>
            <Clock className="h-4 w-4 text-[#FBBC05]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#000000]">{totalHours}h {remainingMinutes}m</div>
            <p className="text-xs text-[#555555]">Today's total operation time</p>
          </CardContent>
        </Card>

        <Card className="border-[#BCBBBB]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#555555]">Pick vs No Pick Time</CardTitle>
            <Activity className="h-4 w-4 text-[#FBBC05]" />
          </CardHeader>
          <CardContent className="pb-2">
            <div className="h-[100px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pickTimeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={25}
                    outerRadius={40}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pickTimeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`${Math.floor(value / 60)}h ${value % 60}m`, '']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 text-xs mt-1">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-[#FBBC05]"></div>
                <span className="text-[#555555]">Pick: {Math.floor(pickTimeData[0].value / 60)}h {pickTimeData[0].value % 60}m</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-[#BCBBBB]"></div>
                <span className="text-[#555555]">No Pick: {Math.floor(pickTimeData[1].value / 60)}h {pickTimeData[1].value % 60}m</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#BCBBBB]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#555555]">Total Picks</CardTitle>
            <Package className="h-4 w-4 text-[#FBBC05]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#000000]">47</div>
            <p className="text-xs text-[#555555]">Lifts completed today</p>
          </CardContent>
        </Card>

        <Card className="border-[#BCBBBB]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#555555]">Total Tonnage</CardTitle>
            <Weight className="h-4 w-4 text-[#FBBC05]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#000000]">124.5 <span className="text-lg">tons</span></div>
            <p className="text-xs text-[#555555]">Material moved today</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-[#BCBBBB]">
        <CardHeader>
          <CardTitle className="text-[#555555] flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-[#FBBC05]" />
            Daily Pick Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-6 mb-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-[#555555]">Y-Axis:</span>
              <RadioGroup 
                value={selectedMetric} 
                onValueChange={(value) => setSelectedMetric(value as "duration" | "tonnage")}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="duration" id="duration" />
                  <Label htmlFor="duration" className="text-sm text-[#555555]">Pick Duration</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="tonnage" id="tonnage" />
                  <Label htmlFor="tonnage" className="text-sm text-[#555555]">Tonnage</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="flex items-center gap-2">
              <Switch 
                id="wind-toggle" 
                checked={showWindSpeed}
                onCheckedChange={setShowWindSpeed}
              />
              <Label htmlFor="wind-toggle" className="text-sm text-[#555555] flex items-center gap-1">
                <Wind className="h-4 w-4" />
                Show Wind Speed
              </Label>
            </div>
          </div>

          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={combinedData} margin={{ top: 20, right: showWindSpeed ? 60 : 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#BCBBBB" />
                <XAxis 
                  dataKey="timeLabel"
                  stroke="#555555"
                  tick={{ fontSize: 10 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  yAxisId="picks"
                  domain={getYAxisDomain()}
                  stroke="#555555"
                  label={{ value: getYAxisLabel(), angle: -90, position: "insideLeft", fill: "#555555" }}
                />
                {showWindSpeed && (
                  <YAxis 
                    yAxisId="wind"
                    orientation="right"
                    domain={[0, 30]}
                    stroke="#555555"
                    label={{ value: "Wind (mph)", angle: 90, position: "insideRight", fill: "#555555" }}
                  />
                )}
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 border border-[#BCBBBB] rounded shadow-md">
                          <p className="text-sm font-bold text-[#000000] mb-2">Pick Details</p>
                          <p className="text-sm text-[#555555]">Time Start: {data.timeStart}</p>
                          <p className="text-sm text-[#555555]">Time End: {data.timeEnd}</p>
                          <p className="text-sm text-[#555555]">Duration: {data.durationMinutes} min</p>
                          <p className="text-sm text-[#555555]">Tonnage: {data.tonnage} tons</p>
                          <p className="text-sm text-[#555555]">Wind Speed: {data.windSpeed} mph</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                
                <Bar 
                  name={selectedMetric === "duration" ? "Pick Duration" : "Pick Tonnage"}
                  dataKey={selectedMetric === "duration" ? "durationMinutes" : "tonnage"}
                  fill="#FBBC05"
                  yAxisId="picks"
                  radius={[4, 4, 0, 0]}
                />
                
                {showWindSpeed && (
                  <Line 
                    name="Wind Speed"
                    type="monotone"
                    dataKey="windSpeed"
                    stroke="#555555"
                    strokeWidth={2}
                    dot={false}
                    yAxisId="wind"
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-[#BCBBBB]">
          <CardHeader>
            <CardTitle className="text-[#555555] flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-[#FBBC05]" />
              Weekly Activity Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                const percentage = [85, 92, 78, 95, 88, 45, 30][index];
                return (
                  <div key={day} className="flex items-center gap-4">
                    <span className="w-12 text-sm text-[#555555]">{day}</span>
                    <div className="flex-1 bg-[#BCBBBB] rounded-full h-3">
                      <div 
                        className="bg-[#FBBC05] h-3 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-12 text-sm text-right text-[#555555]">{percentage}%</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#BCBBBB]">
          <CardHeader>
            <CardTitle className="text-[#555555] flex items-center gap-2">
              <Activity className="h-5 w-5 text-[#FBBC05]" />
              Recent Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-[#000000]">System Online</p>
                  <p className="text-xs text-[#555555]">All devices connected - 2 minutes ago</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-[#000000]">Signal Strength Low</p>
                  <p className="text-xs text-[#555555]">Antenna Box - 15 minutes ago</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-[#000000]">Recording Started</p>
                  <p className="text-xs text-[#555555]">New clip captured - 20 minutes ago</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-[#000000]">Daily Backup Complete</p>
                  <p className="text-xs text-[#555555]">156 clips synced to S3 - 1 hour ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-[#BCBBBB]">
        <CardHeader>
          <CardTitle className="text-[#555555] flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[#FBBC05]" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-[#F5F5F5] rounded-lg">
              <div className="text-3xl font-bold text-[#FBBC05]">98.5%</div>
              <p className="text-sm text-[#555555] mt-1">Video Quality</p>
              <p className="text-xs text-[#555555]">Average bitrate maintained</p>
            </div>
            
            <div className="text-center p-4 bg-[#F5F5F5] rounded-lg">
              <div className="text-3xl font-bold text-[#FBBC05]">2.3s</div>
              <p className="text-sm text-[#555555] mt-1">Avg. Latency</p>
              <p className="text-xs text-[#555555]">Stream to cloud delay</p>
            </div>
            
            <div className="text-center p-4 bg-[#F5F5F5] rounded-lg">
              <div className="text-3xl font-bold text-[#FBBC05]">4.2GB</div>
              <p className="text-sm text-[#555555] mt-1">Storage Used Today</p>
              <p className="text-xs text-[#555555]">156 clips @ ~27MB each</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
