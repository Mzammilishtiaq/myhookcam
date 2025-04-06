// Add global typings
interface Window {
  pageTitleContext?: {
    setCameraName: (name: string) => void;
    setJobsiteName: (name: string) => void;
    setPageTitle: (title: string) => void;
  };
}