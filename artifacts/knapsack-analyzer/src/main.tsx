import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./i18n";

// Apply dark theme by default
document.documentElement.classList.add("dark");

createRoot(document.getElementById("root")!).render(<App />);
