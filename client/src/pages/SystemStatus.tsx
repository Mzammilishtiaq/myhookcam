import { Card } from "@/components/ui/card";

export default function SystemStatus() {
  return (
    <div className="container mx-auto p-4">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4 text-[#555555]">System Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        <div className="mt-4 p-4 bg-[#FBBC05]/10 rounded-lg border border-[#FBBC05]">
          <p className="text-[#555555]">This is a placeholder for the System Status functionality. Real-time system metrics will be displayed here.</p>
        </div>
      </Card>
    </div>
  );
}