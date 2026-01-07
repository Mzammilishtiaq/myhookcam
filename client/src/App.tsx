import React, { useState, useEffect, createContext, useContext } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Sidebar } from "@/components/ui/sidebar";
import { Menu, X } from "lucide-react";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import LiveStream from "@/pages/LiveStream";
import Recordings from "@/pages/Recordings";
import SystemStatus from "@/pages/SystemStatus";
import Insights from "@/pages/Insights";
import CameraDashboard from "@/pages/CameraDashboard";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import useSidebarStore from "@/hooks/use-sidebar";

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
  handleSelectionChange: () => {},
};

// Default page title context
const defaultPageTitleContext: PageTitleContextType = {
  pageTitle: "System",
  setPageTitle: () => {},
  cameraName: "",
  setCameraName: () => {},
  jobsiteName: "",
  setJobsiteName: () => {},
};

// Context will be used just for jobsite/camera selection
export const SelectionContext = createContext<SelectionContextType>(defaultSelectionContext);

// Context for page title management
export const PageTitleContext = createContext<PageTitleContextType>(defaultPageTitleContext);

// Add a provider hook for better debugging
export function usePageTitle() {
  const context = useContext(PageTitleContext);
  if (context === undefined) {
    throw new Error('usePageTitle must be used within a PageTitleProvider');
  }
  return context;
}

function MainNavigation() {
  const [location, setLocation] = useLocation();
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
    if (location.startsWith('/cameras')) {
      // Use static "HookCam Dashboard" title since jobsite name is already displayed in main title
      title = <><span className="text-[#FBBC05]">HookCam</span> Dashboard</>;
    } 
    // Check if we're on a specific camera view and have a camera name
    else if (cameraName && (location === '/livestream' || location === '/recordings' || location === '/system-status' || location === '/insights')) {
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
    <div className="bg-[#555555] text-[#FFFFFF] px-4 pt-4 shadow-md">
      <div className="w-full">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            {/* Menu button - always visible on mobile and when sidebar is collapsed on desktop */}
            {(!isOpen || isMobileView) && (
              <Button 
                variant="ghost" 
                size="sm"
                className="mr-3 text-white hover:bg-[#666666] transition-colors"
                onClick={handleMenuClick}
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
            <h1 className="text-xl font-semibold">
              {getHeaderTitle()}
            </h1>
          </div>
        </div>
        
        {/* Only show tabs when NOT on the dashboard pages */}
        {!location.startsWith('/cameras') && (
          <Tabs value={location === "/" ? "/livestream" : location} className="w-full">
            <TabsList className="w-full">
              <TabsTrigger 
                value="/livestream" 
                className="flex-1 data-[state=active]:text-[#FBBC05] data-[state=active]:border-b-2 data-[state=active]:border-[#FBBC05]"
                onClick={() => setLocation("/livestream")}
              >
                Live Stream
              </TabsTrigger>
              <TabsTrigger 
                value="/insights" 
                className="flex-1 data-[state=active]:text-[#FBBC05] data-[state=active]:border-b-2 data-[state=active]:border-[#FBBC05]"
                onClick={() => setLocation("/insights")}
              >
                Insights
              </TabsTrigger>
              <TabsTrigger 
                value="/recordings" 
                className="flex-1 data-[state=active]:text-[#FBBC05] data-[state=active]:border-b-2 data-[state=active]:border-[#FBBC05]"
                onClick={() => setLocation("/recordings")}
              >
                Recordings
              </TabsTrigger>
              <TabsTrigger 
                value="/system-status" 
                className="flex-1 data-[state=active]:text-[#FBBC05] data-[state=active]:border-b-2 data-[state=active]:border-[#FBBC05]"
                onClick={() => setLocation("/system-status")}
              >
                System Status
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}
      </div>
    </div>
  );
}

function Layout() {
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
        className="w-full bg-[#555555] z-40 relative"
        style={{
          marginLeft: isOpen && !isMobileView ? '280px' : '0',
          transition: 'margin-left 0.3s ease-in-out'
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
          width: '100%',
          transition: 'margin-left 0.3s ease-in-out',
          marginLeft: isOpen && !isMobileView ? '280px' : '0' // Add space for the sidebar
        }}>
          {/* Content area - header is now placed outside this div so it can extend full width */}
          
          {/* Main content */}
          <main className="flex-grow p-4">
            <Switch>
              <Route path="/" component={LiveStream} />
              <Route path="/livestream" component={LiveStream} />
              <Route path="/recordings" component={Recordings} />
              <Route path="/system-status" component={SystemStatus} />
              <Route path="/insights" component={Insights} />
              <Route path="/cameras">
                {(params) => <CameraDashboard />}
              </Route>
              <Route path="/cameras/:jobsiteId">
                {(params) => <CameraDashboard jobsiteId={params.jobsiteId} />}
              </Route>
              <Route component={NotFound} />
            </Switch>
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

function App() {
  // Camera selection state
  const [selectedCameras, setSelectedCameras] = useState<number[]>([]);
  const [selectedJobsites, setSelectedJobsites] = useState<number[]>([]);
  
  // Page title state
  const [pageTitle, setPageTitle] = useState("System");
  const [cameraName, setCameraName] = useState("");
  const [jobsiteName, setJobsiteName] = useState("");
  
  // Load selection from localStorage on initial mount
  useEffect(() => {
    try {
      const storedSelection = localStorage.getItem('cameraSelection');
      if (storedSelection) {
        const { selectedCameras: storedCameras, selectedJobsites: storedJobsites } = JSON.parse(storedSelection);
        if (Array.isArray(storedCameras) && storedCameras.length > 0) {
          setSelectedCameras(storedCameras);
        }
        if (Array.isArray(storedJobsites) && storedJobsites.length > 0) {
          setSelectedJobsites(storedJobsites);
        }
      }
    } catch (error) {
      console.error("Error loading camera selection from localStorage:", error);
    }
    
    // Expose context to window for direct access from components
    // that might not have React context available (e.g., external libraries)
    window.pageTitleContext = {
      setCameraName,
      setJobsiteName, 
      setPageTitle
    };
    
    return () => {
      // Clean up on unmount
      delete window.pageTitleContext;
    };
  }, []);
  
  // Watch for window events to update title state from other components
  useEffect(() => {
    // Listen for storage events (for cross-tab sync)
    const handleStorageEvent = (event: StorageEvent) => {
      if (event.key === 'cameraSelection') {
        try {
          // Try to load camera info from session storage
          const savedCameraInfo = sessionStorage.getItem('currentCameraInfo');
          if (savedCameraInfo) {
            const parsedInfo = JSON.parse(savedCameraInfo);
            setCameraName(parsedInfo.name);
            setJobsiteName(parsedInfo.jobsiteName);
            setPageTitle(`${parsedInfo.name} at ${parsedInfo.jobsiteName}`);
            console.log("App.tsx updated title from localStorage event:", parsedInfo);
          }
        } catch (e) {
          console.error("Error loading camera info from session storage:", e);
        }
      }
    };
    
    // Listen for custom titleUpdate events
    const handleTitleUpdateEvent = (event: CustomEvent) => {
      const { cameraName: newCameraName, jobsiteName: newJobsiteName, pageTitle: newPageTitle } = event.detail;
      setCameraName(newCameraName);
      setJobsiteName(newJobsiteName);
      setPageTitle(newPageTitle);
      console.log("App.tsx updated title from custom event:", newPageTitle);
    };
    
    // Add event listeners
    window.addEventListener('storage', handleStorageEvent);
    window.addEventListener('titleUpdate', handleTitleUpdateEvent as EventListener);
    
    // Also check for existing session storage on initial mount
    try {
      const savedCameraInfo = sessionStorage.getItem('currentCameraInfo');
      if (savedCameraInfo) {
        const parsedInfo = JSON.parse(savedCameraInfo);
        setCameraName(parsedInfo.name);
        setJobsiteName(parsedInfo.jobsiteName);
        setPageTitle(`${parsedInfo.name} at ${parsedInfo.jobsiteName}`);
        console.log("App.tsx initialized title from sessionStorage:", parsedInfo);
      }
    } catch (e) {
      console.error("Error loading camera info from session storage:", e);
    }
    
    return () => {
      window.removeEventListener('storage', handleStorageEvent);
      window.removeEventListener('titleUpdate', handleTitleUpdateEvent as EventListener);
    };
  }, []);
  
  const handleSelectionChange = (jobsiteIds: number[], cameraIds: number[]) => {
    setSelectedJobsites(jobsiteIds);
    setSelectedCameras(cameraIds);
    
    // Save selection to localStorage for persistence
    try {
      localStorage.setItem('cameraSelection', JSON.stringify({
        selectedCameras: cameraIds,
        selectedJobsites: jobsiteIds
      }));
    } catch (error) {
      console.error("Error saving camera selection to localStorage:", error);
    }
  };
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <PageTitleContext.Provider value={{
          pageTitle,
          setPageTitle,
          cameraName,
          setCameraName,
          jobsiteName,
          setJobsiteName
        }}>
          <SelectionContext.Provider value={{
            selectedCameras,
            selectedJobsites,
            handleSelectionChange
          }}>
            <Layout />
            <Toaster />
          </SelectionContext.Provider>
        </PageTitleContext.Provider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
