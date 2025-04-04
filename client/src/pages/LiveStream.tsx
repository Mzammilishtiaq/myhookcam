import { Card } from "@/components/ui/card";

export default function LiveStream() {
  return (
    <div className="container mx-auto p-4">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4 text-[#555555]"><span className="text-[#FBBC05]">HookCam</span> Live Stream</h2>
        <div className="bg-[#555555] rounded-lg aspect-video flex items-center justify-center">
          <p className="text-[#FFFFFF] text-lg">Live stream content will appear here</p>
        </div>
        <div className="mt-4 p-4 bg-[#FBBC05]/10 rounded-lg border border-[#FBBC05]">
          <p className="text-[#555555]">This is a placeholder for the Live Stream functionality. Real-time video stream will be integrated here.</p>
        </div>
      </Card>
    </div>
  );
}