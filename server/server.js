import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { rateLimit } from "express-rate-limit";
import fetch from "node-fetch";
import authRoutes from "./routes/auth.js";
import accountRoutes from "./routes/account.js";
import { errorHandler } from "./middleware/errorHandler.js";
import "./database/init.js"; // Initialize database

dotenv.config();

// Ping API_URL every 10 minutes to prevent Render free server from idling
const API_URL =
  process.env.API_URL || `http://localhost:${process.env.PORT || 3001}/health`;
setInterval(
  () => {
    fetch(API_URL)
      .then((res) => res.text())
      .then(() => {
        console.log(`[CRON] Pinged ${API_URL} to keep server alive.`);
      })
      .catch((err) => {
        console.error(`[CRON] Failed to ping ${API_URL}:`, err.message);
      });
  },
  10 * 60 * 1000,
); // 10 minutes

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "MT4 API Server is running" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/account", accountRoutes);

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`🚀 MT4 API Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
});
