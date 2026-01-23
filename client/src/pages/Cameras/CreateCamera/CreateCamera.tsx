import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@radix-ui/react-label'
import { Camera, Trash2 } from 'lucide-react'
import React from 'react'

function CreateCamera() {
    return (
        <div className="w-full h-full min-h-[calc(100vh-140px)] py-6 px-4">
            <Card className="border-none shadow-none bg-transparent">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-10 px-0">
                    <div>
                        <CardTitle className="flex items-center gap-3 text-4xl font-bold">
                            <Camera className="h-10 w-10 text-[#FBBC05]" />
                            Create Camera
                        </CardTitle>
                        <CardDescription className="mt-2 text-xl">Configure hardware settings and connection</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="space-y-10 px-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-3">
                            <Label className="text-lg">Camera Name</Label>
                            <Input
                                className="h-14 text-lg"
                                placeholder='Enter a Camera Name'
                            // value={formData.companyName}
                            // onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                            />
                            <Button className="h-16 px-10 text-xl bg-[#FBBC05] hover:bg-[#e5a900] rounded-none">Create New Camera</Button>

                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default CreateCamera