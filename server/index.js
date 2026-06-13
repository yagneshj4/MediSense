require("dotenv").config();
require("express-async-errors");

const express  = require("express");
const cors     = require("cors");
const helmet   = require("helmet");
const morgan   = require("morgan");
const mongoose = require("mongoose");
const path     = require("path");
const logger   = require("./utils/logger");

const authRoutes         = require("./routes/auth");
const predictRoutes      = require("./routes/predict");
const chatRoutes         = require("./routes/chat");
const prescriptionRoutes = require("./routes/prescriptions");
const predictionRoutes   = require("./routes/predictions");
const errorHandler       = require("./middleware/errorHandler");

const app = express();

// ── Security & Logging ───────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(morgan("dev"));

// ── CORS ─────────────────────────────────────────────────────────────
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
app.use(cors({
  origin: [CLIENT_URL, "http://localhost:5173", "http://localhost:3000"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// ── Body Parser ───────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ── Static Files (served prescription uploads) ────────────────────────
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ── API Routes ────────────────────────────────────────────────────────
app.use("/api/auth",          authRoutes);
app.use("/api/predict",       predictRoutes);
app.use("/api/chat",          chatRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/predictions",   predictionRoutes);

// ── Health Check ──────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "medi-assist-api", time: new Date().toISOString() });
});

// ── 404 handler ───────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

// ── Global Error Handler ──────────────────────────────────────────────
app.use(errorHandler);

// ── MongoDB Connection ────────────────────────────────────────────────
const PORT     = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/mediassist";

async function startServer() {
  // Validate critical security keys on startup
  if (!process.env.JWT_SECRET) {
    logger.error("🚨 CRITICAL STARTUP ERROR: Missing required environment variable: JWT_SECRET");
    logger.error("Please configure JWT_SECRET inside your 'server/.env' file to secure auth tokens.");
    process.exit(1);
  }

  // Validate optional integrations and log warning
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "your_gemini_api_key" || process.env.GEMINI_API_KEY === "your_google_ai_studio_api_key") {
    logger.warn("⚠️  WARNING: GEMINI_API_KEY is missing or using placeholder. Gemini AI features will be disabled; chatbot will fall back to rule-based responses.");
  }

  try {
    logger.info("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    logger.info("✅ MongoDB connected");
  } catch (err) {
    logger.error(`❌ MongoDB connection failed: ${err.message}`);
    logger.info("🔄 Attempting fallback to In-Memory MongoDB (mongodb-memory-server)...");
    try {
      const { MongoMemoryServer } = require("mongodb-memory-server");
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      logger.info(`ℹ️ In-Memory MongoDB Server started at: ${mongoUri}`);
      await mongoose.connect(mongoUri);
      logger.info("✅ Connected to In-Memory MongoDB");
    } catch (fallbackErr) {
      logger.error(`❌ In-Memory MongoDB fallback failed: ${fallbackErr.message}`);
      logger.info("Please wait for npm install to finish or run: npm install mongodb-memory-server --save-dev");
      process.exit(1);
    }
  }

  app.listen(PORT, () => {
    logger.info(`🚀 Medi-Assist API running → http://localhost:${PORT}`);
    logger.info(`📋 Health check         → http://localhost:${PORT}/api/health`);
  });
}

if (require.main === module) {
  startServer();
}

module.exports = app;
