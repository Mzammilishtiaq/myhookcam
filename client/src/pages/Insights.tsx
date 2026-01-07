import { useContext } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SelectionContext } from "@/App";
import { BarChart3, TrendingUp, Clock, Activity, AlertTriangle, CheckCircle } from "lucide-react";

export default function Insights() {
  const { selectedCameras } = useContext(SelectionContext);

  return (
    <div className="space-y-6" data-testid="insights-page">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-[#BCBBBB]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#555555]">Total Runtime Today</CardTitle>
            <Clock className="h-4 w-4 text-[#FBBC05]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#000000]">8h 42m</div>
            <p className="text-xs text-[#555555]">+12% from yesterday</p>
          </CardContent>
        </Card>

        <Card className="border-[#BCBBBB]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#555555]">Active Devices</CardTitle>
            <Activity className="h-4 w-4 text-[#FBBC05]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#000000]">5/5</div>
            <p className="text-xs text-[#555555]">All systems operational</p>
          </CardContent>
        </Card>

        <Card className="border-[#BCBBBB]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#555555]">Recordings Today</CardTitle>
            <BarChart3 className="h-4 w-4 text-[#FBBC05]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#000000]">156</div>
            <p className="text-xs text-[#555555]">5-minute clips captured</p>
          </CardContent>
        </Card>

        <Card className="border-[#BCBBBB]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#555555]">Uptime</CardTitle>
            <TrendingUp className="h-4 w-4 text-[#FBBC05]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#000000]">99.2%</div>
            <p className="text-xs text-[#555555]">Last 7 days</p>
          </CardContent>
        </Card>
      </div>

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
