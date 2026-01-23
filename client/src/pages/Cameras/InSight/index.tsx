import React from 'react'
import PickAnalytics from './PickAnalytics'
import DailyPickActivity from './DailyPickActivity'
import PickDetailsTable from './PickDetailsTable'
import PickLocationHeatmap from './PickLocationHeatmap'

function Insights() {
  return (
    <div className="space-y-6" data-testid="insights-page">
        <PickAnalytics/>
        <DailyPickActivity/>
        <PickDetailsTable/>
        <PickLocationHeatmap/>
    </div>
  )
}

export default Insights