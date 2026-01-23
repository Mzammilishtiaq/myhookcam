import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin } from 'lucide-react'
import React, { useState } from 'react'
import MapContainer from '@/components/Map/Map'

function PickLocationHeatmap() {
    const [heatmapBackgroundUrl, setHeatmapBackgroundUrl] = useState<string>("");

    return (
        <Card className="border-[#BCBBBB]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-medium text-[#555555] flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-[#FBBC05]" />
                    Pick Location Heatmap
                </CardTitle>
                {/* <div className="flex items-center gap-2">
            <Input
              placeholder="Enter background image URL..."
              value={heatmapBackgroundUrl}
              onChange={(e) => setHeatmapBackgroundUrl(e.target.value)}
              className="w-64 text-sm"
              data-testid="heatmap-bg-input"
            />
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const url = URL.createObjectURL(file);
                    setHeatmapBackgroundUrl(url);
                  }
                }}
                data-testid="heatmap-bg-file"
              />
              <Button variant="outline" size="sm" className="border-[#BCBBBB]" asChild>
                <span>
                  <Upload className="h-4 w-4 mr-1" />
                  Upload
                </span>
              </Button>
            </label>
          </div> */}
            </CardHeader>
            <CardContent>
                <div
                    className="relative w-full h-[400px] rounded-lg overflow-hidden border border-[#BCBBBB]"
                    style={{
                        background: heatmapBackgroundUrl
                            ? `url(${heatmapBackgroundUrl}) center/cover no-repeat`
                            : 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)'
                    }}
                    data-testid="heatmap-container"
                >
                    <MapContainer />
                    <div className="absolute bottom-4 left-4 bg-white/90 rounded-lg p-3 shadow-lg z-50">
                        <p className="text-xs font-semibold text-[#555555] mb-2">Tonnage Legend</p>
                        <div className="flex items-center gap-3 text-xs text-[#555555]">
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 rounded-full bg-[#555555]" />
                                <span>&lt; 2 tons</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 rounded-full bg-[#f59e0b]" />
                                <span>2-4 tons</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 rounded-full bg-[#FBBC05]" />
                                <span>&gt; 4 tons</span>
                            </div>
                        </div>
                    </div>
                    {/* Stats overlay */}
                    <div className="absolute top-4 right-4 bg-white/90 rounded-lg p-3 shadow-lg z-50">
                        <p className="text-xs font-semibold text-[#555555] mb-1">Today's Stats</p>
                        <p className="text-xs text-[#555555]">
                            {/* {pickEvents.length} */}
                            picks recorded</p>
                        <p className="text-xs text-[#555555]">
                            {/* {pickEvents.reduce((sum, p) => sum + p.tonnage, 0).toFixed(1)} */}
                            total tons</p>
                    </div>
                </div>
            </CardContent>
        </Card>)
}

export default PickLocationHeatmap