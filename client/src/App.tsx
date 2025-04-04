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

// Context type
type AppContextType = {
  selectedCameras: number[];
  selectedJobsites: number[];
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  handleSelectionChange: (jobsiteIds: number[], cameraIds: number[]) => void;
};

// Default context
const defaultAppContext: AppContextType = {
  selectedCameras: [],
  selectedJobsites: [],
  isSidebarOpen: true,
  toggleSidebar: () => {},
  handleSelectionChange: () => {},
};

// This Context will be used to share selected jobsites/cameras across the app
export const AppContext = createContext<AppContextType>(defaultAppContext);

function MainNavigation() {
  const [location, setLocation] = useLocation();
  const appContext = useContext(AppContext);
  const { isSidebarOpen, toggleSidebar } = appContext;
  
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
  
  return (
    <div className="bg-[#555555] text-[#FFFFFF] px-4 pt-4 shadow-md">
      <div className="w-full">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            {/* Mobile menu button */}
            {isMobileView && !isSidebarOpen && (
              <Button 
                variant="ghost" 
                size="sm"
                className="mr-3 text-white hover:bg-[#666666] transition-colors"
                onClick={toggleSidebar}
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

function Router() {
  const appContext = useContext(AppContext);
  const { isSidebarOpen, toggleSidebar, handleSelectionChange } = appContext;
  
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
  
  return (
    <div className="min-h-screen flex bg-[#FFFFFF]">
      {/* Hamburger menu toggle button - always visible on desktop when sidebar is collapsed */}
      {!isMobileView && !isSidebarOpen && (
        <div className="h-screen flex items-start absolute left-0 top-0 z-10">
          <Button
            variant="ghost" 
            size="sm"
            className="m-2 text-[#555555] hover:bg-[#FBBC05]/10 transition-colors rounded-md h-10 w-10 flex items-center justify-center shadow-md"
            onClick={toggleSidebar}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      )}
      
      {/* Sidebar - fixed position on mobile, auto width on desktop */}
      {isMobileView ? (
        // Mobile sidebar with overlay
        isSidebarOpen && (
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
              onClick={toggleSidebar}
            >
              <X className="h-4 w-4" />
            </Button>
          </>
        )
      ) : (
        // Desktop sidebar with width transition
        <div 
          className={`min-h-screen overflow-hidden transition-all duration-300 ease-in-out
            ${isSidebarOpen ? 'w-[280px]' : 'w-0'}`}
        >
          <div className={`h-screen transition-all duration-300 ${!isSidebarOpen ? 'transform -translate-x-full' : ''}`}>
            <Sidebar onSelectionChange={handleSelectionChange} />
          </div>
        </div>
      )}
      
      {/* Main content column - includes header, tabs, content, footer */}
      <div className={`flex flex-col transition-all duration-300 ${
        isSidebarOpen && !isMobileView ? 'w-[calc(100%-280px)]' : 'w-full'
      }`}>
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const toggleSidebar = () => {
    console.log("Toggling sidebar from", isSidebarOpen, "to", !isSidebarOpen);
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  const handleSelectionChange = (jobsiteIds: number[], cameraIds: number[]) => {
    setSelectedJobsites(jobsiteIds);
    setSelectedCameras(cameraIds);
  };
  
  return (
    <QueryClientProvider client={queryClient}>
      <AppContext.Provider value={{
        selectedCameras,
        selectedJobsites,
        isSidebarOpen,
        toggleSidebar,
        handleSelectionChange
      }}>
        <Router />
        <Toaster />
      </AppContext.Provider>
    </QueryClientProvider>
  );
}

export default App;
