import { useState, useEffect, createContext, useContext } from "react";
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

// This Context will be used to share selected jobsites/cameras across the app
export const AppContext = createContext<{
  selectedCameras: number[];
  selectedJobsites: number[];
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  handleSelectionChange: (jobsiteIds: number[], cameraIds: number[]) => void;
}>({
  selectedCameras: [],
  selectedJobsites: [],
  isSidebarOpen: true,
  toggleSidebar: () => {},
  handleSelectionChange: () => {},
});

function MainNavigation() {
  const [location, setLocation] = useLocation();
  const { isSidebarOpen, toggleSidebar } = useContext(AppContext);
  
  return (
    <div className="bg-[#555555] text-[#FFFFFF] px-4 pt-4 shadow-md">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              className="mr-2 text-white md:hidden" 
              onClick={toggleSidebar}
            >
              {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
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
  const { isSidebarOpen, handleSelectionChange } = useContext(AppContext);
  
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
    <div className="min-h-screen flex flex-col bg-[#FFFFFF]">
      <MainNavigation />
      
      <main className="flex-grow flex">
        {/* Sidebar - visible on medium+ screens or when toggled on mobile */}
        {(isSidebarOpen || !isMobileView) && (
          <div className={`${
            isMobileView ? 'fixed inset-0 z-50 bg-black/50' : 'w-1/4 md:w-1/5 lg:w-1/6 xl:w-1/5'
          }`}>
            <div className={`${
              isMobileView ? 'h-full w-3/4 max-w-xs bg-white' : 'h-full'
            }`}>
              <Sidebar 
                onSelectionChange={handleSelectionChange}
              />
            </div>
          </div>
        )}
        
        {/* Main content area - takes remaining space */}
        <div className={`${
          isSidebarOpen && !isMobileView 
            ? 'w-3/4 md:w-4/5 lg:w-5/6 xl:w-4/5' 
            : 'w-full'
        }`}>
          <div className="p-4">
            <Switch>
              <Route path="/" component={LiveStream} />
              <Route path="/livestream" component={LiveStream} />
              <Route path="/recordings" component={Recordings} />
              <Route path="/system-status" component={SystemStatus} />
              <Route component={NotFound} />
            </Switch>
          </div>
        </div>
      </main>
      
      <footer className="bg-[#BCBBBB] text-[#555555] p-3 text-sm text-center">
        <div className="container mx-auto">
          <p><span className="font-semibold"><span className="text-[#FBBC05]">HookCam</span> System v1.0</span> | Connected to AWS S3 Storage</p>
        </div>
      </footer>
    </div>
  );
}

function App() {
  const [selectedCameras, setSelectedCameras] = useState<number[]>([]);
  const [selectedJobsites, setSelectedJobsites] = useState<number[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const toggleSidebar = () => {
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
