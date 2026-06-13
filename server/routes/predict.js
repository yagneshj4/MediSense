const express = require("express");
const { predict, getSymptoms } = require("../controllers/predictController");
const { predictionLimiter } = require("../middleware/rateLimiter");

const router = express.Router();

router.post("/", predictionLimiter, predict);
router.get("/symptoms", getSymptoms);

module.exports = router;
