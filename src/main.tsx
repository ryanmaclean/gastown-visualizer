import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { applyStoredScale } from "./components/ScaleSwitcher";

applyStoredScale();

createRoot(document.getElementById("root")!).render(<App />);
