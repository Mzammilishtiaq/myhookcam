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
    // Default header title
    let title = <><span className="text-[#FBBC05]">HookCam</span> System</>;
    
    // Check if we're on Camera Dashboard page
    if (location.startsWith('/cameras')) {
      if (jobsiteName) {
        title = <>{jobsiteName} <span className="text-[#FBBC05]">Dashboard</span></>;
      } else {
        title = <><span className="text-[#FBBC05]">All Jobsites</span> Dashboard</>;
      }
    } 
    // Check if we're on a specific camera view
    else if (cameraName && (location === '/livestream' || location === '/recordings' || location === '/system-status')) {
      if (jobsiteName) {
        title = <><span className="text-[#FBBC05]">HookCam</span> {cameraName} at {jobsiteName}</>;
      } else {
        title = <><span className="text-[#FBBC05]">HookCam</span> {cameraName}</>;
      }
    }
    
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
