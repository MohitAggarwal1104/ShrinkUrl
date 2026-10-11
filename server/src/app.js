import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import urlRoutes from "./routes/urls.js";
import ShortUrl from "./models/ShortUrl.js";

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  methods: ["GET", "POST", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json({ limit: "20kb" }));

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRoutes);
app.use("/api/urls", urlRoutes);

app.get("/:code", async (req, res, next) => {
  try {
    const code = String(req.params.code || "").toLowerCase();
    // Keep unknown / API paths from being treated as short links.
    if (code === "api" || code.includes(".")) return res.status(404).send("Not found");
    const link = await ShortUrl.findOneAndUpdate(
      { code },
      { $inc: { clicks: 1 } },
      { new: true }
    );
    if (!link) return res.status(404).send("This short link does not exist.");
    return res.redirect(302, link.originalUrl);
  } catch (error) {
    next(error);
  }
});

app.use((req, res) => res.status(404).json({ message: "Route not found." }));
app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: "Something went wrong on the server." });
});

export default app;
