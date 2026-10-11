import "dotenv/config";
import app from "./app.js";
import dns from "node:dns";
import mongoose from "mongoose";
import { connectDB } from "./config/db.js";

dns.setServers(["8.8.8.8"]);

let connectionPromise;

async function initializeDatabase() {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (!connectionPromise) {
    connectionPromise = connectDB().catch((error) => {
      connectionPromise = null;
      throw error;
    });
  }

  await connectionPromise;
}

// Ensure MongoDB is connected before handling API requests.
app.use(async (req, res, next) => {
  try {
    await initializeDatabase();
    next();
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);

    res.status(503).json({
      message: "Database unavailable. Please try again later.",
    });
  }
});

// Health check
app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    database:
      mongoose.connection.readyState === 1
        ? "connected"
        : "disconnected",
  });
});

// API routes are already mounted in app.js:
// /api/auth
// /api/urls

export default app;