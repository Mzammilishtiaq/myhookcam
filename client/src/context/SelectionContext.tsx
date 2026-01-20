import { createContext, useContext } from "react";

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
type SelectionContextType = {
  selectedCameras: number[];
  selectedJobsites: number[];
  handleSelectionChange: (jobsiteIds: number[], cameraIds: number[]) => void;
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
export const PageTitleContext = createContext<PageTitleContextType>(defaultPageTitleContext);

// Add a provider hook for better debugging
export function usePageTitle() {
  const context = useContext(PageTitleContext);
  if (context === undefined) {
    throw new Error('usePageTitle must be used within a PageTitleProvider');
  }
  return context;
}