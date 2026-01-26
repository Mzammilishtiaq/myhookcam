import React from 'react'
import RecordingArchive from './RecordingArchive'
import RecordingPlayer from './RecordingPlayer'
import VideoJsZoomPlayer from '@/components/ui/Videojs'

function Recording() {
    return (
        <div className="container mx-auto p-4">
            <RecordingArchive/>
            <RecordingPlayer/>
        </div>
    )
}

export default Recording