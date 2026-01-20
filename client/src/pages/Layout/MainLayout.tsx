import { Button } from "@/components/ui/button";
import useSidebarStore from "@/hooks/use-sidebar";
import { X } from "lucide-react";
import { createContext, useContext, useEffect, useState } from "react";
import Sidebar from '@/components/Sidebar/SidebarLayout'
import MainNavigation from "@/pages/Layout/MainNavigation"
import { Outlet } from "react-router-dom";
// Context type for selection
type SelectionContextType = {
  selectedCameras: number[];
  selectedJobsites: number[];
  handleSelectionChange: (jobsiteIds: number[], cameraIds: number[]) => void;
};

// Context type for page title
type PageTitleContextType = {
  pageTitle: string;
  setPageTitle: (title: string) => void;
  cameraName: string;
  setCameraName: (name: string) => void;
  jobsiteName: string;
  setJobsiteName: (name: string) => void;
};

// Default selection context
const defaultSelectionContext: SelectionContextType = {
  selectedCameras: [],
  selectedJobsites: [],
  handleSelectionChange: () => { },
};

// Default page title context
const defaultPageTitleContext: PageTitleContextType = {
  pageTitle: "System",
  setPageTitle: () => { },
  cameraName: "",
  setCameraName: () => { },
  jobsiteName: "",
  setJobsiteName: () => { },
};

// Context will be used just for jobsite/camera selection
export const SelectionContext = createContext<SelectionContextType>(defaultSelectionContext);

// Context for page title management
// export const PageTitleContext = createContext<PageTitleContextType>(defaultPageTitleContext);


function MainLayout() {
  const selectionContext = useContext(SelectionContext);
  const { handleSelectionChange } = selectionContext;
  const { isOpen, toggle } = useSidebarStore();


  // Function to determine if the screen is mobile
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    // Check screen size on mount and when window resizes
    const checkScreenSize = () => {
      setIsMobileView(window.innerWidth < 768); // 768px is standard tablet breakpoint
    };

    // Initial check
    checkScreenSize();

    // Add resize listener
    window.addEventListener('resize', checkScreenSize);

    // Clean up
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Handle toggle with debug log
  const handleToggleClick = () => {
    console.log("Toggle button clicked in layout, current state:", isOpen);
    toggle();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFFFF]">
      {/* Header positioned as a fixed-width element at the top */}
      <div
        className="bg-[#555555] z-40 relative"
        style={{
          marginLeft: isOpen && !isMobileView ? '280px' : '0',
          width: isOpen && !isMobileView ? 'calc(100% - 280px)' : '100%',
          transition: 'margin-left 0.3s ease-in-out, width 0.3s ease-in-out'
        }}
      >
        <MainNavigation />
      </div>

      {/* Main content area with sidebar and content */}
      <div className="flex flex-1">
        {/* Hamburger menu toggle button moved to header */}

        {/* Sidebar - fixed position on mobile, auto width on desktop */}
        {isMobileView ? (
          // Mobile sidebar with overlay
          isOpen && (
            <>
              <div className="fixed inset-0 z-50 bg-black/50">
                <div className="h-full w-[280px] max-w-xs">
                  <Sidebar onSelectionChange={handleSelectionChange} />
                </div>
              </div>

              {/* Mobile close button */}
              <Button
                variant="ghost"
                size="sm"
                className="fixed top-4 right-4 z-[60] bg-white rounded-full h-8 w-8 p-0 shadow-md"
                onClick={handleToggleClick}
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          )
        ) : (
          // Desktop sidebar with inline styles for more reliable transitions - now fixed position
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            height: '100vh',
            width: isOpen ? '280px' : '0',
            overflow: 'hidden',
            transition: 'width 0.3s ease-in-out',
            zIndex: 30
          }}>
            <div style={{
              height: '100vh',
              width: '280px',
              transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
              transition: 'transform 0.3s ease-in-out'
            }}>
              <Sidebar onSelectionChange={handleSelectionChange} />
            </div>
          </div>
        )}

        {/* Main content column - includes content and footer */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          width: isOpen && !isMobileView ? 'calc(100% - 280px)' : '100%',
          transition: 'margin-left 0.3s ease-in-out, width 0.3s ease-in-out',
          marginLeft: isOpen && !isMobileView ? '280px' : '0'
        }}>
          {/* Content area - header is now placed outside this div so it can extend full width */}

          {/* Main content */}
          <main className="flex-grow p-4">
           <Outlet/>
          </main>

          {/* Footer */}
          <footer className="bg-[#BCBBBB] text-[#555555] p-3 text-sm text-center">
            <p><span className="font-semibold"><span className="text-[#FBBC05]">HookCam</span> System v1.0</span> | Connected to AWS S3 Storage</p>
          </footer>
        </div>
      </div>
    </div>
  );
}

export default MainLayout;