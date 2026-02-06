import { Button } from "@/components/ui/button";
import useSidebarStore from "@/hooks/use-sidebar";
import { MapPin, Menu, Plus, UserPlus } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PageTitleContext } from "@/context/SelectionContext"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { useAuthStore } from '@/hooks/authStore';
import { UserType } from "@/hooks/enum";
function MainNavigation() {
  const { logout, user } = useAuthStore()
  const location = useLocation();
  const pathname = location.pathname;
  const navigate = useNavigate();
  const { isOpen, toggle, checkScreenSize, isMobileView } = useSidebarStore();
  const { pageTitle, cameraName, jobsiteName } = useContext(PageTitleContext);

  useEffect(() => {
    checkScreenSize(); // initial check
    window.addEventListener("resize", checkScreenSize); // listen to resize
    return () => window.removeEventListener("resize", checkScreenSize);
  }, [checkScreenSize]);

  // Handle toggle with detailed debug log
  const handleMenuClick = () => {
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
    let title = <><span className="text-[#FBBC05]">HookCam</span> </>;

    // Check if we're on Dashboard page
    if (pathname.startsWith('camera/list')) {
      // Use static "HookCam Dashboard" title since jobsite name is already displayed in main title
      title = <><span className="text-[#FBBC05]">HookCam</span> Dashboard</>;
    }
    // Check if we're on a specific camera view and have a camera name
    else if (cameraName && (pathname === 'camera/livestream' || pathname === 'camera/recordings' || pathname === 'camera/system-status' || pathname === 'camera/insights')) {
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
          <div className="flex items-center gap-2">
            {/* {(user?.userType === UserType.ADMIN) && ( */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-[#FBBC05] border-[#FBBC05] bg-white/10 hover:bg-[#FBBC05] hover:text-white"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  New
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-white rounded">
                <DropdownMenuItem onClick={() => navigate("jobsite/create")} className="text-black flex  gap-x-2 items-center text-sm p-2 mb-2 cursor-pointer">
                  <MapPin className="h-4 w-4 text-[#FBBC05]" />
                  Create Site
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("user/create")} className="text-black flex  gap-x-2 items-center text-sm p-2 mb-2 cursor-pointer">
                  <UserPlus className="h-4 w-4 text-[#FBBC05]" />
                  Create User
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {/* )} */}
            {/* {userRole && ( */}
            <Button
              variant="outline"
              size="sm"
              className="text-white border-white/20 bg-white/10 hover:bg-white/20"
              onClick={() => {
                logout();
                navigate('/login')
              }}
            >
              Logout
            </Button>
            {/* )} */}
          </div>
        </div>

        {!pathname.startsWith("/camera/list") &&
          !pathname.startsWith("/admin-dashboard") &&
          !pathname.startsWith("/users") &&
          !pathname.startsWith("/camera/setting") &&
          !pathname.startsWith("/jobsite/setting") &&
          !pathname.startsWith("/jobsite/create") &&
          !pathname.startsWith("/camera/create") &&
          (
            <div className="w-full overflow-hidden -mx-2 sm:-mx-4 px-2 sm:px-4">
              <div className="flex w-full bg-white rounded-md">
                <button
                  className={`flex-1 py-2 text-center text-[11px] sm:text-sm font-medium transition-colors ${pathname === "/" || pathname === "/camera/livestream" ? "text-[#FBBC05] border-b-2 border-[#FBBC05]" : "text-[#555555] hover:bg-gray-100"}`}
                  onClick={() => navigate("/camera/livestream")}
                >
                  Live
                </button>
                <button
                  className={`flex-1 py-2 text-center text-[11px] sm:text-sm font-medium transition-colors ${pathname === "/camera/insights" ? "text-[#FBBC05] border-b-2 border-[#FBBC05]" : "text-[#555555] hover:bg-gray-100"}`}
                  onClick={() => navigate("/camera/insights")}
                >
                  Insights
                </button>
                <button
                  className={`flex-1 py-2 text-center text-[11px] sm:text-sm font-medium transition-colors ${pathname === "/camera/recordings" ? "text-[#FBBC05] border-b-2 border-[#FBBC05]" : "text-[#555555] hover:bg-gray-100"}`}
                  onClick={() => navigate("/camera/recordings")}
                >
                  Recordings
                </button>
                <button
                  className={`flex-1 py-2 text-center text-[11px] sm:text-sm font-medium transition-colors ${pathname === "/camera/system-status" ? "text-[#FBBC05] border-b-2 border-[#FBBC05]" : "text-[#555555] hover:bg-gray-100"}`}
                  onClick={() => navigate("/camera/system-status")}
                >
                  Status
                </button>
              </div>
            </div>
          )}
      </div>

      {/* </div> */}
    </div>
  );
}

export default MainNavigation;