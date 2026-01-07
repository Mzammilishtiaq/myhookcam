import { useContext, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SelectionContext } from "@/App";
import { BarChart3, TrendingUp, Clock, Activity, AlertTriangle, CheckCircle, Package, Weight, Wind, Star, Share2, X, Play } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Legend, BarChart, ReferenceLine } from "recharts";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

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
}

export default function Insights() {
  const { selectedCameras } = useContext(SelectionContext);
  const [selectedMetric, setSelectedMetric] = useState<"duration" | "tonnage">("duration");
  const [showWindSpeed, setShowWindSpeed] = useState(false);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [starredPicks, setStarredPicks] = useState<Set<string>>(new Set());
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedPickForShare, setSelectedPickForShare] = useState<PickEvent | null>(null);
  const [shareEmails, setShareEmails] = useState("");
  const [shareMessage, setShareMessage] = useState("");
  const { toast } = useToast();

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

  const pickEvents: PickEvent[] = [
    { id: "PK-7A3F2B", pickNumber: 1, timeStart: "6:30 AM", timeEnd: "6:38 AM", durationMinutes: 8, tonnage: 3.2, hour: 6.5, thumbnailUrl: "/api/placeholder/120/68", videoUrl: "https://hookcam.com/clips/pk-7a3f2b" },
    { id: "PK-9D4E1C", pickNumber: 2, timeStart: "7:15 AM", timeEnd: "7:20 AM", durationMinutes: 5, tonnage: 2.1, hour: 7.25, thumbnailUrl: "/api/placeholder/120/68", videoUrl: "https://hookcam.com/clips/pk-9d4e1c" },
    { id: "PK-2B5F8A", pickNumber: 3, timeStart: "8:00 AM", timeEnd: "8:12 AM", durationMinutes: 12, tonnage: 5.8, hour: 8.0, thumbnailUrl: "/api/placeholder/120/68", videoUrl: "https://hookcam.com/clips/pk-2b5f8a" },
    { id: "PK-6C1D3E", pickNumber: 4, timeStart: "8:45 AM", timeEnd: "8:51 AM", durationMinutes: 6, tonnage: 2.5, hour: 8.75, thumbnailUrl: "/api/placeholder/120/68", videoUrl: "https://hookcam.com/clips/pk-6c1d3e" },
    { id: "PK-8E2G4H", pickNumber: 5, timeStart: "9:30 AM", timeEnd: "9:40 AM", durationMinutes: 10, tonnage: 4.2, hour: 9.5, thumbnailUrl: "/api/placeholder/120/68", videoUrl: "https://hookcam.com/clips/pk-8e2g4h" },
    { id: "PK-1A9B7C", pickNumber: 6, timeStart: "10:15 AM", timeEnd: "10:19 AM", durationMinutes: 4, tonnage: 1.8, hour: 10.25, thumbnailUrl: "/api/placeholder/120/68", videoUrl: "https://hookcam.com/clips/pk-1a9b7c" },
    { id: "PK-3D5F2E", pickNumber: 7, timeStart: "11:00 AM", timeEnd: "11:07 AM", durationMinutes: 7, tonnage: 3.5, hour: 11.0, thumbnailUrl: "/api/placeholder/120/68", videoUrl: "https://hookcam.com/clips/pk-3d5f2e" },
    { id: "PK-5G7H9I", pickNumber: 8, timeStart: "11:30 AM", timeEnd: "11:39 AM", durationMinutes: 9, tonnage: 4.0, hour: 11.5, thumbnailUrl: "/api/placeholder/120/68", videoUrl: "https://hookcam.com/clips/pk-5g7h9i" },
    { id: "PK-2J4K6L", pickNumber: 9, timeStart: "1:00 PM", timeEnd: "1:11 PM", durationMinutes: 11, tonnage: 5.2, hour: 13.0, thumbnailUrl: "/api/placeholder/120/68", videoUrl: "https://hookcam.com/clips/pk-2j4k6l" },
    { id: "PK-8M1N3O", pickNumber: 10, timeStart: "1:45 PM", timeEnd: "1:51 PM", durationMinutes: 6, tonnage: 2.8, hour: 13.75, thumbnailUrl: "/api/placeholder/120/68", videoUrl: "https://hookcam.com/clips/pk-8m1n3o" },
    { id: "PK-4P6Q8R", pickNumber: 11, timeStart: "2:30 PM", timeEnd: "2:38 PM", durationMinutes: 8, tonnage: 3.6, hour: 14.5, thumbnailUrl: "/api/placeholder/120/68", videoUrl: "https://hookcam.com/clips/pk-4p6q8r" },
    { id: "PK-9S2T4U", pickNumber: 12, timeStart: "3:15 PM", timeEnd: "3:20 PM", durationMinutes: 5, tonnage: 2.2, hour: 15.25, thumbnailUrl: "/api/placeholder/120/68", videoUrl: "https://hookcam.com/clips/pk-9s2t4u" },
    { id: "PK-1V3W5X", pickNumber: 13, timeStart: "4:00 PM", timeEnd: "4:10 PM", durationMinutes: 10, tonnage: 4.5, hour: 16.0, thumbnailUrl: "/api/placeholder/120/68", videoUrl: "https://hookcam.com/clips/pk-1v3w5x" },
    { id: "PK-6Y8Z2A", pickNumber: 14, timeStart: "4:30 PM", timeEnd: "4:37 PM", durationMinutes: 7, tonnage: 3.1, hour: 16.5, thumbnailUrl: "/api/placeholder/120/68", videoUrl: "https://hookcam.com/clips/pk-6y8z2a" },
    { id: "PK-3B5C7D", pickNumber: 15, timeStart: "5:15 PM", timeEnd: "5:19 PM", durationMinutes: 4, tonnage: 1.9, hour: 17.25, thumbnailUrl: "/api/placeholder/120/68", videoUrl: "https://hookcam.com/clips/pk-3b5c7d" },
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

  const getWindSpeedForPick = (hour: number) => {
    const windEntry = windData.find(w => Math.floor(hour) === w.hour);
    return windEntry?.windSpeed || 0;
  };

  const toggleStar = (pickId: string) => {
    setStarredPicks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(pickId)) {
        newSet.delete(pickId);
      } else {
        newSet.add(pickId);
      }
      return newSet;
    });
  };

  const handleShare = (pick: PickEvent) => {
    setSelectedPickForShare(pick);
    setShareEmails("");
    setShareMessage("");
    setShareModalOpen(true);
  };

  const sendShare = () => {
    if (!selectedPickForShare || !shareEmails.trim()) {
      toast({
        title: "Error",
        description: "Please enter at least one email address",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Pick Shared",
      description: `Pick ${selectedPickForShare.id} shared with ${shareEmails.split(',').length} recipient(s)`
    });
    setShareModalOpen(false);
  };

  const updateNote = (pickId: string, note: string) => {
    setNotes(prev => ({ ...prev, [pickId]: note }));
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

      <Card className="border-[#BCBBBB]">
        <CardHeader>
          <CardTitle className="text-[#555555] flex items-center gap-2">
            <Activity className="h-5 w-5 text-[#FBBC05]" />
            Pick Details Table
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#555555]">
                  <TableHead className="text-white font-medium">Pick ID</TableHead>
                  <TableHead className="text-white font-medium text-center">Pick #</TableHead>
                  <TableHead className="text-white font-medium">Thumbnail</TableHead>
                  <TableHead className="text-white font-medium">Start</TableHead>
                  <TableHead className="text-white font-medium">End</TableHead>
                  <TableHead className="text-white font-medium">Duration</TableHead>
                  <TableHead className="text-white font-medium">Wind (mph)</TableHead>
                  <TableHead className="text-white font-medium">Notes</TableHead>
                  <TableHead className="text-white font-medium text-center">Star</TableHead>
                  <TableHead className="text-white font-medium text-center">Share</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pickEvents.map((pick) => (
                  <TableRow key={pick.id} className="hover:bg-gray-50" data-testid={`pick-row-${pick.id}`}>
                    <TableCell className="font-mono text-sm text-[#555555]">{pick.id}</TableCell>
                    <TableCell className="text-center text-[#555555]">{pick.pickNumber}</TableCell>
                    <TableCell>
                      <div className="relative w-[120px] h-[68px] bg-[#555555] rounded overflow-hidden cursor-pointer group">
                        <img 
                          src={`https://picsum.photos/seed/${pick.id}/120/68`}
                          alt={`Pick ${pick.id} thumbnail`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                          <Play className="h-8 w-8 text-white opacity-80 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs px-1 py-0.5 text-center">
                          {pick.durationMinutes}m
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-[#555555]">{pick.timeStart}</TableCell>
                    <TableCell className="text-[#555555]">{pick.timeEnd}</TableCell>
                    <TableCell className="text-[#555555]">{pick.durationMinutes} min</TableCell>
                    <TableCell className="text-[#555555]">{getWindSpeedForPick(pick.hour)}</TableCell>
                    <TableCell>
                      <Input
                        placeholder="Add note..."
                        value={notes[pick.id] || ""}
                        onChange={(e) => updateNote(pick.id, e.target.value)}
                        className="w-[150px] text-sm border-[#BCBBBB]"
                        data-testid={`note-input-${pick.id}`}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleStar(pick.id)}
                        data-testid={`star-btn-${pick.id}`}
                      >
                        <Star 
                          className={`h-5 w-5 ${starredPicks.has(pick.id) ? 'fill-[#FBBC05] text-[#FBBC05]' : 'text-[#BCBBBB]'}`} 
                        />
                      </Button>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleShare(pick)}
                        data-testid={`share-btn-${pick.id}`}
                      >
                        <Share2 className="h-5 w-5 text-[#555555] hover:text-[#FBBC05]" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={shareModalOpen} onOpenChange={setShareModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-[#555555] flex items-center gap-2">
              <Share2 className="h-5 w-5 text-[#FBBC05]" />
              Share Pick {selectedPickForShare?.id}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-[#555555]">Email Recipients</Label>
              <Input
                placeholder="Enter email addresses (comma-separated)"
                value={shareEmails}
                onChange={(e) => setShareEmails(e.target.value)}
                data-testid="share-emails-input"
              />
              <p className="text-xs text-[#BCBBBB]">Separate multiple emails with commas</p>
            </div>
            
            <div className="space-y-2">
              <Label className="text-[#555555]">Message (Optional)</Label>
              <Textarea
                placeholder="Add a message to include with the shared pick..."
                value={shareMessage}
                onChange={(e) => setShareMessage(e.target.value)}
                rows={3}
                data-testid="share-message-input"
              />
            </div>
            
            {selectedPickForShare && (
              <div className="bg-[#F5F5F5] p-3 rounded-lg space-y-2">
                <p className="text-sm font-medium text-[#555555]">Pick Information:</p>
                <div className="text-sm text-[#555555] space-y-1">
                  <p>Pick ID: <span className="font-mono">{selectedPickForShare.id}</span></p>
                  <p>Time: {selectedPickForShare.timeStart} - {selectedPickForShare.timeEnd}</p>
                  <p>Duration: {selectedPickForShare.durationMinutes} min</p>
                  <p>Tonnage: {selectedPickForShare.tonnage} tons</p>
                </div>
                <div className="pt-2">
                  <p className="text-sm text-[#555555]">Video Link:</p>
                  <a 
                    href={selectedPickForShare.videoUrl} 
                    className="text-sm text-[#FBBC05] hover:underline break-all"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {selectedPickForShare.videoUrl}
                  </a>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShareModalOpen(false)} data-testid="share-cancel-btn">
              Cancel
            </Button>
            <Button 
              onClick={sendShare} 
              className="bg-[#FBBC05] hover:bg-[#FBBC05]/90 text-black"
              data-testid="share-send-btn"
            >
              Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
