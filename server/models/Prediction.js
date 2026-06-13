const mongoose = require("mongoose");

const predictionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    symptoms: [{
      type: String,
    }],
    predictedDisease: {
      type: String,
      required: true,
    },
    confidence: {
      type: Number,
      required: true,
    },
    precautions: [{
      type: String,
    }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Prediction", predictionSchema);
