import React, { useState, useEffect, createContext, useContext } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PageTitleContext, SelectionContext } from '@/context/SelectionContext'
import MainLayout from "./pages/Layout/MainLayout";
import ProtectRoute from "./hooks/ProtectRoute";
import Login from '@/pages/Auth/Login'
import { GetStorage } from "./Utlis/authServices";
import AppRouting from "./AppRouting";
import { LoadingAnimation } from "./components/ui/LoadingAnimation";

function App() {
  // Camera selection state
  const [selectedCameras, setSelectedCameras] = useState<number[]>([]);
  const [selectedJobsites, setSelectedJobsites] = useState<number[]>([]);
  const [fullscreenloading, setFullscreenLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      setFullscreenLoading(false);
    }, 2500); // Show animation for 2.5 seconds

    return () => clearTimeout(timer);
  }, []);
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
        {fullscreenloading && <LoadingAnimation />}
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
            <AppRouting />
            <Toaster />
          </SelectionContext.Provider>
        </PageTitleContext.Provider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
