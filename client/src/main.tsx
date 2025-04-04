import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add a title to the page
document.title = "Video Timeline Viewer";

createRoot(document.getElementById("root")!).render(<App />);
