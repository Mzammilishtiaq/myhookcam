import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import CustomDatePicker from '@/components/ui/customDataPicker'
import { Popover, PopoverContent, PopoverTrigger } from '@radix-ui/react-popover'
import { Activity, Calendar, Clock, Package, Weight } from 'lucide-react'
import React from 'react'
import { Button } from '@/components/ui/button'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

function PickAnalytics() {
    const pickTimeData = [
        { name: "Pick Time", value: 312, color: "#FBBC05" },
        { name: "No Pick Time", value: 210, color: "#BCBBBB" }
    ];
    const totalMinutes = pickTimeData[0].value + pickTimeData[1].value;
    const totalHours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;
    return (
        <div className="space-y-6" data-testid="insights-page">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-[#555555]">Pick Analytics</h2>
                    <CustomDatePicker
                        initialDate={new Date("2025-02-05")}
                        onChange={(date) => {
                            console.log(date)
                        }}
                    />
            </div>

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
        </div>
    )
}

export default PickAnalytics