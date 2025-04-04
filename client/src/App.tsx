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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import useSidebarStore from "@/hooks/use-sidebar";

// Context type for selection
type SelectionContextType = {
  selectedCameras: number[];
  selectedJobsites: number[];
  handleSelectionChange: (jobsiteIds: number[], cameraIds: number[]) => void;
};

// Default context
const defaultSelectionContext: SelectionContextType = {
  selectedCameras: [],
  selectedJobsites: [],
  handleSelectionChange: () => {},
};

// Context will be used just for jobsite/camera selection
export const SelectionContext = createContext<SelectionContextType>(defaultSelectionContext);

function MainNavigation() {
  const [location, setLocation] = useLocation();
  const { isOpen, toggle } = useSidebarStore();
  
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
  
  // Handle toggle with debug log
  const handleMenuClick = () => {
    console.log("Menu button clicked in header");
    toggle();
  };
  
  return (
    <div className="bg-[#555555] text-[#FFFFFF] px-4 pt-4 shadow-md">
      <div className="w-full">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            {/* Mobile menu button */}
            {isMobileView && !isOpen && (
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
              <span className="text-[#FBBC05]">HookCam</span> System
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
    <div className="min-h-screen flex bg-[#FFFFFF]">
      {/* Hamburger menu toggle button - always visible on desktop when sidebar is collapsed */}
      {!isMobileView && !isOpen && (
        <div className="h-screen flex items-start absolute left-0 top-0 z-10">
          <Button
            variant="ghost" 
            size="sm"
            className="m-2 text-[#555555] hover:bg-[#FBBC05]/10 transition-colors rounded-md h-10 w-10 flex items-center justify-center shadow-md"
            onClick={handleToggleClick}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      )}
      
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
        // Desktop sidebar with inline styles for more reliable transitions
        <div style={{
          minHeight: '100vh',
          width: isOpen ? '280px' : '0',
          overflow: 'hidden',
          transition: 'width 0.3s ease-in-out'
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
      
      {/* Main content column - includes header, tabs, content, footer */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        width: isOpen && !isMobileView ? 'calc(100% - 280px)' : '100%',
        transition: 'width 0.3s ease-in-out'
      }}>
        {/* Header and tab navigation */}
        <MainNavigation />
        
        {/* Main content */}
        <main className="flex-grow p-4">
          <Switch>
            <Route path="/" component={LiveStream} />
            <Route path="/livestream" component={LiveStream} />
            <Route path="/recordings" component={Recordings} />
            <Route path="/system-status" component={SystemStatus} />
            <Route component={NotFound} />
          </Switch>
        </main>
        
        {/* Footer */}
        <footer className="bg-[#BCBBBB] text-[#555555] p-3 text-sm text-center">
          <p><span className="font-semibold"><span className="text-[#FBBC05]">HookCam</span> System v1.0</span> | Connected to AWS S3 Storage</p>
        </footer>
      </div>
    </div>
  );
}

function App() {
  const [selectedCameras, setSelectedCameras] = useState<number[]>([]);
  const [selectedJobsites, setSelectedJobsites] = useState<number[]>([]);
  
  const handleSelectionChange = (jobsiteIds: number[], cameraIds: number[]) => {
    setSelectedJobsites(jobsiteIds);
    setSelectedCameras(cameraIds);
  };
  
  return (
    <QueryClientProvider client={queryClient}>
      <SelectionContext.Provider value={{
        selectedCameras,
        selectedJobsites,
        handleSelectionChange
      }}>
        <Layout />
        <Toaster />
      </SelectionContext.Provider>
    </QueryClientProvider>
  );
}

export default App;
