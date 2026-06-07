require("dotenv").config();
require("express-async-errors");

const express  = require("express");
const cors     = require("cors");
const helmet   = require("helmet");
const morgan   = require("morgan");
const mongoose = require("mongoose");
const path     = require("path");

const authRoutes         = require("./routes/auth");
const predictRoutes      = require("./routes/predict");
const chatRoutes         = require("./routes/chat");
const prescriptionRoutes = require("./routes/prescriptions");
const contactRoutes      = require("./routes/contact");
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
app.use("/api/contact",       contactRoutes);
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
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    console.log("🔄 Attempting fallback to In-Memory MongoDB (mongodb-memory-server)...");
    try {
      const { MongoMemoryServer } = require("mongodb-memory-server");
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      console.log(`ℹ️ In-Memory MongoDB Server started at: ${mongoUri}`);
      await mongoose.connect(mongoUri);
      console.log("✅ Connected to In-Memory MongoDB");
    } catch (fallbackErr) {
      console.error("❌ In-Memory MongoDB fallback failed:", fallbackErr.message);
      console.log("Please wait for npm install to finish or run: npm install mongodb-memory-server --save-dev");
      process.exit(1);
    }
  }

  app.listen(PORT, () => {
    console.log(`🚀 Medi-Assist API running → http://localhost:${PORT}`);
    console.log(`📋 Health check         → http://localhost:${PORT}/api/health`);
  });
}

startServer();
