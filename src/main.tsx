import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { registerEngineEventHandlers } from "@/services/event-dispatcher.service";
import { getZentroFlowStore } from "@/store/opportunity-store";

registerEngineEventHandlers(getZentroFlowStore);

createRoot(document.getElementById("root")!).render(<App />);
