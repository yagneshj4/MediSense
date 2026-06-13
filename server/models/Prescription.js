const mongoose = require("mongoose");

const prescriptionSchema = new mongoose.Schema(
  {
    userId:       { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    originalName: { type: String, required: true },
    storedName:   { type: String, required: true },
    fileType:     { type: String, required: true },
    note:         { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Prescription", prescriptionSchema);
