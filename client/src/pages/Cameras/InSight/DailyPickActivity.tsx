import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@radix-ui/react-label';
import { RadioGroup, RadioGroupItem } from '@radix-ui/react-radio-group';
import { Switch } from '@radix-ui/react-switch';
import { BarChart3, Wind } from 'lucide-react';
import React, { useState } from 'react'
import { Bar, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
interface PickEvent {
  id: string;
  pickNumber: number;
  timeStart: string;
  timeEnd: string;
  durationMinutes: number;
  tonnage: number;
  hour: number;
  thumbnailUrl: string;
  videoUrl: string;
  locationX: number;
  locationY: number;
}
function DailyPickActivity() {

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
    const pickEvents: PickEvent[] = [
    { id: "PK-7A3F2B", pickNumber: 1, timeStart: "6:30 AM", timeEnd: "6:38 AM", durationMinutes: 8, tonnage: 3.2, hour: 6.5, thumbnailUrl: "/api/placeholder/120/68", videoUrl: "https://hookcam.com/clips/pk-7a3f2b", locationX: 25, locationY: 30 },
    { id: "PK-9D4E1C", pickNumber: 2, timeStart: "7:15 AM", timeEnd: "7:20 AM", durationMinutes: 5, tonnage: 2.1, hour: 7.25, thumbnailUrl: "/api/placeholder/120/68", videoUrl: "https://hookcam.com/clips/pk-9d4e1c", locationX: 45, locationY: 20 },
    { id: "PK-2B5F8A", pickNumber: 3, timeStart: "8:00 AM", timeEnd: "8:12 AM", durationMinutes: 12, tonnage: 5.8, hour: 8.0, thumbnailUrl: "/api/placeholder/120/68", videoUrl: "https://hookcam.com/clips/pk-2b5f8a", locationX: 65, locationY: 45 },
    { id: "PK-6C1D3E", pickNumber: 4, timeStart: "8:45 AM", timeEnd: "8:51 AM", durationMinutes: 6, tonnage: 2.5, hour: 8.75, thumbnailUrl: "/api/placeholder/120/68", videoUrl: "https://hookcam.com/clips/pk-6c1d3e", locationX: 35, locationY: 60 },
    { id: "PK-8E2G4H", pickNumber: 5, timeStart: "9:30 AM", timeEnd: "9:40 AM", durationMinutes: 10, tonnage: 4.2, hour: 9.5, thumbnailUrl: "/api/placeholder/120/68", videoUrl: "https://hookcam.com/clips/pk-8e2g4h", locationX: 55, locationY: 35 },
    { id: "PK-1A9B7C", pickNumber: 6, timeStart: "10:15 AM", timeEnd: "10:19 AM", durationMinutes: 4, tonnage: 1.8, hour: 10.25, thumbnailUrl: "/api/placeholder/120/68", videoUrl: "https://hookcam.com/clips/pk-1a9b7c", locationX: 75, locationY: 25 },
    { id: "PK-3D5F2E", pickNumber: 7, timeStart: "11:00 AM", timeEnd: "11:07 AM", durationMinutes: 7, tonnage: 3.5, hour: 11.0, thumbnailUrl: "/api/placeholder/120/68", videoUrl: "https://hookcam.com/clips/pk-3d5f2e", locationX: 20, locationY: 55 },
    { id: "PK-5G7H9I", pickNumber: 8, timeStart: "11:30 AM", timeEnd: "11:39 AM", durationMinutes: 9, tonnage: 4.0, hour: 11.5, thumbnailUrl: "/api/placeholder/120/68", videoUrl: "https://hookcam.com/clips/pk-5g7h9i", locationX: 50, locationY: 70 },
    { id: "PK-2J4K6L", pickNumber: 9, timeStart: "1:00 PM", timeEnd: "1:11 PM", durationMinutes: 11, tonnage: 5.2, hour: 13.0, thumbnailUrl: "/api/placeholder/120/68", videoUrl: "https://hookcam.com/clips/pk-2j4k6l", locationX: 40, locationY: 40 },
    { id: "PK-8M1N3O", pickNumber: 10, timeStart: "1:45 PM", timeEnd: "1:51 PM", durationMinutes: 6, tonnage: 2.8, hour: 13.75, thumbnailUrl: "/api/placeholder/120/68", videoUrl: "https://hookcam.com/clips/pk-8m1n3o", locationX: 60, locationY: 55 },
    { id: "PK-4P6Q8R", pickNumber: 11, timeStart: "2:30 PM", timeEnd: "2:38 PM", durationMinutes: 8, tonnage: 3.6, hour: 14.5, thumbnailUrl: "/api/placeholder/120/68", videoUrl: "https://hookcam.com/clips/pk-4p6q8r", locationX: 30, locationY: 75 },
    { id: "PK-9S2T4U", pickNumber: 12, timeStart: "3:15 PM", timeEnd: "3:20 PM", durationMinutes: 5, tonnage: 2.2, hour: 15.25, thumbnailUrl: "/api/placeholder/120/68", videoUrl: "https://hookcam.com/clips/pk-9s2t4u", locationX: 70, locationY: 65 },
    { id: "PK-1V3W5X", pickNumber: 13, timeStart: "4:00 PM", timeEnd: "4:10 PM", durationMinutes: 10, tonnage: 4.5, hour: 16.0, thumbnailUrl: "/api/placeholder/120/68", videoUrl: "https://hookcam.com/clips/pk-1v3w5x", locationX: 45, locationY: 50 },
    { id: "PK-6Y8Z2A", pickNumber: 14, timeStart: "4:30 PM", timeEnd: "4:37 PM", durationMinutes: 7, tonnage: 3.1, hour: 16.5, thumbnailUrl: "/api/placeholder/120/68", videoUrl: "https://hookcam.com/clips/pk-6y8z2a", locationX: 80, locationY: 40 },
    { id: "PK-3B5C7D", pickNumber: 15, timeStart: "5:15 PM", timeEnd: "5:19 PM", durationMinutes: 4, tonnage: 1.9, hour: 17.25, thumbnailUrl: "/api/placeholder/120/68", videoUrl: "https://hookcam.com/clips/pk-3b5c7d", locationX: 15, locationY: 80 },
  ];
    const [selectedMetric, setSelectedMetric] = useState<"duration" | "tonnage">("duration");
      const [showWindSpeed, setShowWindSpeed] = useState(false);
      const combinedData = pickEvents.map(pick => {
    const windEntry = windData.find(w => Math.floor(pick.hour) === w.hour) || { windSpeed: 0 };
    return {
      ...pick,
      timeLabel: pick.timeStart,
      windSpeed: windEntry.windSpeed
    };
  });
    const getYAxisDomain = () => {
    if (selectedMetric === "duration") {
      return [0, 15];
    }
    return [0, 7];
  };
    const getYAxisLabel = () => {
    return selectedMetric === "duration" ? "Duration (min)" : "Tonnage (tons)";
  };
  return (
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
                  content={({ active, payload }: { active?: boolean; payload?: any[] }) => {
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
  )
}

export default DailyPickActivity