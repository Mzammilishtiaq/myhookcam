import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Video, MapPin, CheckCircle2, XCircle } from "lucide-react";

export default function AdminDashboard() {
  const stats = [
    { title: "Total Users", value: "25", icon: Users, color: "text-blue-500" },
    { title: "Total Sites", value: "8", icon: MapPin, color: "text-green-500" },
    { title: "Online Cameras", value: "114", icon: CheckCircle2, color: "text-[#FBBC05]" },
    { title: "Offline Cameras", value: "6", icon: XCircle, color: "text-red-500" },
  ];

  return (
    <div className="w-full h-full min-h-[calc(100vh-140px)] py-6 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#555555]">System Overview</h1>
        <p className="text-gray-500">Real-time status of your HookCam ecosystem</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="border-none shadow-sm bg-white rounded-none">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-[#555555]">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-none shadow-sm bg-white rounded-none p-6">
          <h3 className="text-lg font-bold text-[#555555] mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-3 border-b last:border-0">
                <div className="w-2 h-2 rounded-full bg-[#FBBC05]" />
                <div className="flex-1">
                  <p className="text-sm font-medium">New user registered</p>
                  <p className="text-xs text-gray-400">2 hours ago</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card className="border-none shadow-sm bg-white rounded-none p-6">
          <h3 className="text-lg font-bold text-[#555555] mb-4">Site Distribution</h3>
          <div className="space-y-4">
            {['North Site', 'Downtown Hub', 'West Tower'].map((site, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{site}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#FBBC05]" style={{ width: `${80 - (i * 15)}%` }} />
                  </div>
                  <span className="text-xs font-bold">{12 - i} Cams</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
