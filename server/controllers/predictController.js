const axios = require("axios");

const ML_URL = process.env.ML_SERVICE_URL || "http://localhost:5001";

// POST /api/predict
const predict = async (req, res) => {
  const { symptoms } = req.body;

  if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0)
    return res.status(400).json({ success: false, message: "Please provide at least one symptom." });

  try {
    const { data } = await axios.post(`${ML_URL}/ml/predict`, { symptoms }, { timeout: 15000 });

    if (data.emergency) return res.status(200).json({ success: true, emergency: true, message: data.error });
    if (data.error)     return res.status(400).json({ success: false, message: data.error });

    res.json({ success: true, result: data });
  } catch (err) {
    console.error("[Predict Error]", err.message);
    res.status(503).json({ success: false, message: "ML service is unavailable. Please try again." });
  }
};

// GET /api/symptoms
const getSymptoms = async (req, res) => {
  try {
    const { data } = await axios.get(`${ML_URL}/ml/symptoms`, { timeout: 8000 });
    res.json({ success: true, symptoms: data.symptoms });
  } catch (err) {
    console.error("[Symptoms Error]", err.message);
    res.status(503).json({ success: false, message: "ML service unavailable." });
  }
};

module.exports = { predict, getSymptoms };
