import { Button } from "@/components/ui/button";
import useSidebarStore from "@/hooks/use-sidebar";
import { Menu } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PageTitleContext } from "@/context/SelectionContext"


function MainNavigation() {
  const location = useLocation();
  const pathname = location.pathname;
  const navigate = useNavigate();
  const { isOpen, toggle } = useSidebarStore();
  const { pageTitle, cameraName, jobsiteName } = useContext(PageTitleContext);

  // Get isMobile status for this component
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    // Check screen size on mount and when window resizes
    const checkScreenSize = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    // Initial check
    checkScreenSize();

    // Add resize listener
    window.addEventListener('resize', checkScreenSize);

    // Clean up
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Handle toggle with detailed debug log
  const handleMenuClick = () => {
    console.log("Sidebar toggle button clicked");
    console.log("Zustand toggle called");
    toggle();
  };

  // Determine the header title based on the page context
  const getHeaderTitle = () => {
    // Debug log for title generation
    console.log("Generating header title with:", {
      pageTitle,
      cameraName,
      jobsiteName,
      location
    });

    // Default header title
    let title = <><span className="text-[#FBBC05]">HookCam</span> System</>;

    // Check if we're on Dashboard page
    if (pathname.startsWith('/cameras')) {
      // Use static "HookCam Dashboard" title since jobsite name is already displayed in main title
      title = <><span className="text-[#FBBC05]">HookCam</span> Dashboard</>;
    }
    // Check if we're on a specific camera view and have a camera name
    else if (cameraName && (pathname === '/livestream' || pathname === '/recordings' || pathname === '/system-status' || pathname === '/insights')) {
      // Use the exact title that was set by sidebar or LiveStream component
      if (pageTitle && pageTitle !== "Live Stream" && pageTitle !== "System") {
        // The title has already been formatted as "Camera Name at Jobsite Name"
        title = <>{pageTitle}</>;
      }
      // Fallback to camera name only if we don't have a properly formatted title
      else if (cameraName) {
        if (jobsiteName) {
          title = <>{cameraName} at {jobsiteName}</>;
        } else {
          title = <>{cameraName}</>;
        }
      }
    }

    console.log("Generated title:", title);
    return title;
  };

  return (
    <div className="bg-[#555555] text-[#FFFFFF] px-2 sm:px-4 pt-4 shadow-md overflow-hidden">
      <div className="w-full max-w-full">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center min-w-0">
            {(!isOpen || isMobileView) && (
              <Button
                variant="ghost"
                size="sm"
                className="mr-2 sm:mr-3 text-white hover:bg-[#666666] transition-colors flex-shrink-0"
                onClick={handleMenuClick}
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
            <h1 className="text-base sm:text-xl font-semibold truncate">
              {getHeaderTitle()}
            </h1>
          </div>
        </div>

        {!pathname.startsWith('/cameras') && (
          <div className="w-full overflow-hidden -mx-2 sm:-mx-4 px-2 sm:px-4">
            <div className="flex w-full bg-white rounded-md">
              <button
                className={`flex-1 py-2 text-center text-[11px] sm:text-sm font-medium transition-colors ${pathname === "/" || pathname === "/livestream" ? "text-[#FBBC05] border-b-2 border-[#FBBC05]" : "text-[#555555] hover:bg-gray-100"}`}
                onClick={() => navigate("/livestream")}
              >
                Live
              </button>
              <button
                className={`flex-1 py-2 text-center text-[11px] sm:text-sm font-medium transition-colors ${pathname === "/insights" ? "text-[#FBBC05] border-b-2 border-[#FBBC05]" : "text-[#555555] hover:bg-gray-100"}`}
                onClick={() => navigate("/insights")}
              >
                Insights
              </button>
              <button
                className={`flex-1 py-2 text-center text-[11px] sm:text-sm font-medium transition-colors ${pathname === "/recordings" ? "text-[#FBBC05] border-b-2 border-[#FBBC05]" : "text-[#555555] hover:bg-gray-100"}`}
                onClick={() => navigate("/recordings")}
              >
                Recordings
              </button>
              <button
                className={`flex-1 py-2 text-center text-[11px] sm:text-sm font-medium transition-colors ${pathname === "/system-status" ? "text-[#FBBC05] border-b-2 border-[#FBBC05]" : "text-[#555555] hover:bg-gray-100"}`}
                onClick={() => navigate("/system-status")}
              >
                Status
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MainNavigation;