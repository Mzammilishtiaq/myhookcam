import React from 'react'
import { Button } from '../ui/button'
import { User, Menu } from 'lucide-react'
import useSidebarStore from "@/hooks/use-sidebar";

function SidebarHeader() {
  const { toggle } = useSidebarStore();
    // Mocked user data for demo
  const userName = "John Smith";
  // Handle sidebar toggle with logging
  const handleToggleSidebar = () => {
    console.log("Sidebar toggle button clicked");
    toggle();
  };
  return (
      <div className="px-6 py-8 bg-[#555555] text-white rounded-tr-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="flex-shrink-0 w-12 h-12 bg-[#FBBC05] rounded-full flex items-center justify-center mr-3">
              <span className="font-bold text-lg text-white">AC</span>
            </div>
            <div>
              <div className="text-xl font-bold">
                <span className="text-[#FBBC05]">ACME</span> Construction
              </div>
              <div className="text-xs text-gray-300">powered by <span className="text-[#FBBC05]">HookCam</span></div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-white p-1 hover:bg-[#666666] transition-colors"
            onClick={handleToggleSidebar}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex items-center mt-4 pb-3">
          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center mr-2">
            <User className="h-4 w-4 text-gray-600" />
          </div>
          <div>
            <div className="text-sm font-medium">{userName}</div>
            <div className="text-xs text-gray-300">Project Manager</div>
          </div>
        </div>
      </div>
  )
}

export default SidebarHeader