const express = require("express");
const { savePrediction, getPredictionHistory, generatePDFReport } = require("../controllers/predictionController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/save", protect, savePrediction);
router.get("/history/:userId", protect, getPredictionHistory);
router.get("/history", protect, getPredictionHistory); // fallback for convenient calls
router.get("/:id/report", protect, generatePDFReport);

module.exports = router;
