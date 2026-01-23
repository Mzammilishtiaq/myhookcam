import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@radix-ui/react-label'
import { MapPin, Trash2 } from 'lucide-react'
import React from 'react'

function CreateJobsite() {
    return (
        <div className="w-full h-full min-h-[calc(100vh-140px)] py-6 px-4 bg-gray-50/50">
            <div className="bg-white p-8 shadow-sm">
                <div className="flex flex-row items-center justify-between space-y-0 pb-10">
                    <div>
                        <h1 className="flex items-center gap-3 text-4xl font-bold text-[#555555]">
                            <MapPin className="h-10 w-10 text-[#FBBC05]" />
                            Create Jobsite
                        </h1>
                        <p className="mt-2 text-xl text-gray-500">Create a new jobsite and manage site</p>
                    </div>
                </div>
                <div className="space-y-12">
                    <div className="space-y-4">
                        <Label className="text-xl font-bold text-[#555555]">Jobsite Name</Label>
                        <div className="flex gap-4">
                            <Input
                            placeholder='Enter a Jobsite Name'
                                // value={siteName}
                                // onChange={(e) => setSiteName(e.target.value)}
                                className="h-16 text-xl max-w-2xl rounded-none border-[#BCBBBB]"
                            />
                            <Button className="h-16 px-10 text-xl bg-[#FBBC05] hover:bg-[#e5a900] rounded-none">Create New Jobsite</Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CreateJobsite