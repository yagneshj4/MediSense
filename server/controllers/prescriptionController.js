const { Readable } = require("stream");
const axios = require("axios");
const Prescription = require("../models/Prescription");
const cloudinary = require("../utils/cloudinary");

// POST /api/prescriptions/upload  (protected)
const uploadPrescription = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "Please upload a file." });
  }

  const note = req.body.note?.trim() || "";

  try {
    // Upload memory buffer directly to Cloudinary via stream
    const uploadStream = () => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "mediassist_prescriptions",
            resource_type: "auto", // Automatically detects images or pdf
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        Readable.from(req.file.buffer).pipe(stream);
      });
    };

    const uploadResult = await uploadStream();

    const ext = req.file.validatedExt || req.file.originalname.split(".").pop().toLowerCase();

    const prescription = await Prescription.create({
      userId:       req.user._id,
      originalName: req.file.originalname,
      storedName:   uploadResult.public_id, // keep it populated with public ID for backwards compatibility
      fileType:     ext,
      note,
      cloudinaryUrl: uploadResult.secure_url,
      cloudinaryPublicId: uploadResult.public_id,
    });

    res.status(201).json({ success: true, prescription });
  } catch (err) {
    console.error("[Prescription Upload Error]", err.message);
    res.status(500).json({ success: false, message: "Failed to upload prescription." });
  }
};

// GET /api/prescriptions  (protected)
const getPrescriptions = async (req, res) => {
  const list = await Prescription.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, prescriptions: list });
};

// GET /api/prescriptions/:id/file  (protected)
const getPrescriptionFile = async (req, res) => {
  try {
    const item = await Prescription.findOne({ _id: req.params.id, userId: req.user._id });
    if (!item) return res.status(404).json({ success: false, message: "File not found." });

    if (!item.cloudinaryUrl) {
      return res.status(404).json({ success: false, message: "Cloud URL not found for this prescription." });
    }

    // Stream prescription directly from Cloudinary to client
    const response = await axios({
      method: "get",
      url: item.cloudinaryUrl,
      responseType: "stream",
      timeout: 15000,
    });

    res.setHeader("Content-Type", response.headers["content-type"]);
    res.setHeader("Content-Disposition", `attachment; filename="${item.originalName}"`);
    response.data.pipe(res);
  } catch (err) {
    console.error("[Get Prescription File Error]", err.message);
    res.status(500).json({ success: false, message: "Failed to retrieve prescription file." });
  }
};

// DELETE /api/prescriptions/:id  (protected)
const deletePrescription = async (req, res) => {
  try {
    const item = await Prescription.findOne({ _id: req.params.id, userId: req.user._id });
    if (!item) return res.status(404).json({ success: false, message: "Prescription not found." });

    // Delete asset from Cloudinary
    if (item.cloudinaryPublicId) {
      await cloudinary.uploader.destroy(item.cloudinaryPublicId);
    }

    await item.deleteOne();
    res.json({ success: true, message: "Prescription deleted." });
  } catch (err) {
    console.error("[Delete Prescription Error]", err.message);
    res.status(500).json({ success: false, message: "Failed to delete prescription." });
  }
};

module.exports = { uploadPrescription, getPrescriptions, getPrescriptionFile, deletePrescription };
