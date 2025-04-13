import express from "express";
import expressWs from "express-ws";
import cors from "cors";
import WebSocket from "ws";
import { Request } from "express";

// Create express app with websocket support
const { app } = expressWs(express());
const PORT = 4080;

// Enable CORS
app.use(cors());

// Create a simple WebSocket server for keepsync
app.ws("/sync", (ws: WebSocket, req: Request) => {
  console.log("WebSocket connection established");
  
  ws.on("message", (message: string) => {
    console.log("Received:", message);
    // Echo back the message for now
    ws.send(message);
  });

  ws.on("close", () => {
    console.log("WebSocket connection closed");
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });

  // Send a welcome message
  ws.send(JSON.stringify({ type: "connected", message: "WebSocket connected successfully" }));
});

// Basic route for hello world
app.get("/api/hello", (req, res) => {
  res.send("Hello World Api!");
});

app.get("/ping", (req, res) => {
  res.send("pong!");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Sync server available at ws://localhost:${PORT}/sync`);
});
