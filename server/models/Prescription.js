const mongoose = require("mongoose");

const prescriptionSchema = new mongoose.Schema(
  {
    userId:       { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    originalName: { type: String, required: true },
    storedName:   { type: String }, // Optional during/after migration to Cloudinary
    fileType:     { type: String, required: true },
    note:         { type: String, default: "" },
    category:     { type: String, enum: ["Prescription", "Lab Report", "Scan", "Medical Image", "Insurance", "Other"], default: "Other" },
    description:  { type: String, default: "" },
    cloudinaryUrl: { type: String },
    cloudinaryPublicId: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Prescription", prescriptionSchema);
