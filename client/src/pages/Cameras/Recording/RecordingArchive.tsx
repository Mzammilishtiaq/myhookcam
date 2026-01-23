import CustomDatePicker from '@/components/ui/customDataPicker'
import React from 'react'

function RecordingArchive() {
    return (
        <div>  <div className="mb-2 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-[#555555]"><span className="text-[#FBBC05]">HookCam</span> Recording Archive</h2>

            {/* Date Picker */}
            <CustomDatePicker initialDate={new Date("2012-10-02")} onChange={(date)=>{console.log(date)}}/>
        </div>
        </div>
    )
}

export default RecordingArchive