const path = require("path");
const fs = require("fs");
const Prescription = require("../models/Prescription");

// POST /api/prescriptions/upload  (protected)
const uploadPrescription = async (req, res) => {
  if (!req.file)
    return res.status(400).json({ success: false, message: "Please upload a file (PNG, JPG, PDF, WEBP)." });

  const note = req.body.note?.trim() || "";
  const ext  = path.extname(req.file.originalname).toLowerCase().slice(1);

  const prescription = await Prescription.create({
    userId:       req.user._id,
    originalName: req.file.originalname,
    storedName:   req.file.filename,
    fileType:     ext,
    note,
  });

  res.status(201).json({ success: true, prescription });
};

// GET /api/prescriptions  (protected)
const getPrescriptions = async (req, res) => {
  const list = await Prescription.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, prescriptions: list });
};

// GET /api/prescriptions/:id/file  (protected)
const getPrescriptionFile = async (req, res) => {
  const item = await Prescription.findOne({ _id: req.params.id, userId: req.user._id });
  if (!item) return res.status(404).json({ success: false, message: "File not found." });

  const userDir  = path.join(__dirname, "../uploads", String(req.user._id));
  const filePath = path.join(userDir, item.storedName);

  if (!fs.existsSync(filePath))
    return res.status(404).json({ success: false, message: "File has been removed from server." });

  res.sendFile(filePath);
};

// DELETE /api/prescriptions/:id  (protected)
const deletePrescription = async (req, res) => {
  const item = await Prescription.findOne({ _id: req.params.id, userId: req.user._id });
  if (!item) return res.status(404).json({ success: false, message: "Prescription not found." });

  const filePath = path.join(__dirname, "../uploads", String(req.user._id), item.storedName);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  await item.deleteOne();
  res.json({ success: true, message: "Prescription deleted." });
};

module.exports = { uploadPrescription, getPrescriptions, getPrescriptionFile, deletePrescription };
