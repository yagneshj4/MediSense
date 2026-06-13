require("dotenv").config();
require("express-async-errors");

const express  = require("express");
const cors     = require("cors");
const helmet   = require("helmet");
const morgan   = require("morgan");
const mongoose = require("mongoose");
const path     = require("path");
const mongoSanitize = require("express-mongo-sanitize");
const logger   = require("./utils/logger");

const authRoutes         = require("./routes/auth");
const predictRoutes      = require("./routes/predict");
const chatRoutes         = require("./routes/chat");
const prescriptionRoutes = require("./routes/prescriptions");
const predictionRoutes   = require("./routes/predictions");
const adminRoutes        = require("./routes/admin");
const errorHandler       = require("./middleware/errorHandler");

const app = express();

// ── Security & Logging ───────────────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "res.cloudinary.com"],
        connectSrc: ["'self'", "https://generativelanguage.googleapis.com"],
      },
    },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    xContentTypeOptions: true, // Prevents MIME sniffing
    xFrameOptions: { action: "deny" }, // Prevents clickjacking
  })
);

// Route Morgan request logs through Winston structured JSON format logger
app.use(
  morgan(
    ":remote-addr :method :url :status :res[content-length] - :response-time ms",
    {
      stream: {
        write: (message) => logger.info(message.trim()),
      },
    }
  )
);

// ── CORS ─────────────────────────────────────────────────────────────
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
app.use(cors({
  origin: [CLIENT_URL, "http://localhost:5173", "http://localhost:3000", "http://localhost:5000"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// ── Body Parser & Sanitization ────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize()); // Prevent NoSQL injection attacks

// ── API Routes ────────────────────────────────────────────────────────
app.use("/api/auth",          authRoutes);
app.use("/api/predict",       predictRoutes);
app.use("/api/chat",          chatRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/predictions",   predictionRoutes);
app.use("/api/admin",         adminRoutes);

// ── Health Check (Dependency-Aware) ───────────────────────────────────
app.get("/api/health", async (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
  
  let mlStatus = "offline";
  const ML_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";
  try {
    const axios = require("axios");
    const mlRes = await axios.get(`${ML_URL}/ml/health`, { timeout: 2000 });
    if (mlRes.data?.status === "ok") {
      mlStatus = "connected";
    }
  } catch (err) {
    mlStatus = "offline";
  }

  const isHealthy = dbStatus === "connected" && mlStatus === "connected";

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? "ok" : "degraded",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    services: {
      api: "online",
      database: dbStatus,
      ml_service: mlStatus
    }
  });
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
