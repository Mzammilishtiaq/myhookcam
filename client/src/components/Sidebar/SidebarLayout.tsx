import React from 'react'
import { Card } from '../ui/card';
import { Separator } from '@radix-ui/react-separator';
import SidebarHeader from './SidebarHeader';
import SidebarJob from './SidebaJob';
import SidebarFooter from './SidebarFooter';
interface SidebarProps {
  onSelectionChange: (selectedJobsites: number[], selectedCameras: number[]) => void;
}

function SidebarLayout({ onSelectionChange }: SidebarProps) {

  return (
    <Card className="h-full flex flex-col rounded-r-xl shadow-lg w-[280px]">
      <SidebarHeader />
      <Separator className="bg-gray-600" />
      <SidebarJob onSelectionChange={onSelectionChange} />
      <SidebarFooter />
    </Card>
  )
}

export default SidebarLayout