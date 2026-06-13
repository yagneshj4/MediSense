const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  role:      { type: String, enum: ["user", "bot"], required: true },
  text:      { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const chatHistorySchema = new mongoose.Schema(
  {
    userId:      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    messages:    [messageSchema],
    lastDisease: { type: String, default: null },
    lang:        { type: String, default: "en" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ChatHistory", chatHistorySchema);
