import React from "react";
import "./index.css";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { configureSyncEngine } from "@tonk/keepsync";
import {
  registerServiceWorker,
  unregisterServiceWorker,
} from "./serviceWorkerRegistration";

// Service worker logic based on environment
if (process.env.NODE_ENV === "production") {
  // Only register service worker in production mode
  registerServiceWorker();
} else {
  // In development, make sure to unregister any existing service workers
  unregisterServiceWorker();
}

// Setup WebSocket connection for keepsync
// In development, connect directly to the WebSocket server on port 4080
const wsUrl = process.env.NODE_ENV === "production"
  ? `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}/sync`
  : "ws://localhost:4080/sync";

// Configure keepsync engine
configureSyncEngine({
  url: wsUrl,
  onSync: (docId) => {
    console.log(`Document ${docId} synced`);
  },
  onError: (error) => {
    console.error("Sync error:", error);
    // Don't completely break the app on sync errors
    // Just log them for now
  }
});

const container = document.getElementById("root");
if (!container) throw new Error("Failed to find the root element");
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
