import express from "express";
import cors from "cors";
import dns from "node:dns";
import mongoose from "mongoose";

import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import urlRoutes from "./routes/urls.js";
import ShortUrl from "./models/ShortUrl.js";

dns.setServers(["8.8.8.8"]);

const app = express();

const allowedOrigins = [
  "https://shrink-url-7ja5.vercel.app",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "20kb" }));

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

// Connect to MongoDB before handling database-dependent requests.
app.use(async (_req, res, next) => {
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

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    database:
      mongoose.connection.readyState === 1
        ? "connected"
        : "disconnected",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/urls", urlRoutes);

app.get("/:code", async (req, res, next) => {
  try {
    const code = String(req.params.code || "").toLowerCase();

    if (code === "api" || code.includes(".")) {
      return res.status(404).send("Not found");
    }

    const link = await ShortUrl.findOneAndUpdate(
      { code },
      { $inc: { clicks: 1 } },
      { new: true }
    );

    if (!link) {
      return res.status(404).send("This short link does not exist.");
    }

    return res.redirect(302, link.originalUrl);
  } catch (error) {
    next(error);
  }
});

app.use((_req, res) => {
  res.status(404).json({ message: "Route not found." });
});

app.use((error, _req, res, _next) => {
  console.error("Server error:", error);

  res.status(500).json({
    message: "Something went wrong on the server.",
  });
});

export default app;