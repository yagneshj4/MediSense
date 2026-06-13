const { Readable } = require("stream");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const Prescription = require("../models/Prescription");
const cloudinary = require("../utils/cloudinary");

// POST /api/prescriptions/upload  (protected)
const uploadPrescription = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "Please upload a file." });
  }

  const category = req.body.category?.trim() || "Prescription";
  const description = req.body.description?.trim() || "";
  const note = description || req.body.note?.trim() || "";

  // Check if Cloudinary is configured (not placeholders)
  const isCloudinaryConfigured = 
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_CLOUD_NAME !== "your_cloudinary_cloud_name" &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_KEY !== "your_cloudinary_api_key" &&
    process.env.CLOUDINARY_API_SECRET &&
    process.env.CLOUDINARY_API_SECRET !== "your_cloudinary_api_secret";

  try {
    const ext = req.file.validatedExt || req.file.originalname.split(".").pop().toLowerCase();

    if (isCloudinaryConfigured) {
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

      const prescription = await Prescription.create({
        userId:       req.user._id,
        originalName: req.file.originalname,
        storedName:   uploadResult.public_id, // keep it populated with public ID for backwards compatibility
        fileType:     ext,
        note,
        category,
        description,
        cloudinaryUrl: uploadResult.secure_url,
        cloudinaryPublicId: uploadResult.public_id,
      });

      res.status(201).json({ success: true, prescription });
    } else {
      // Local fallback: save file to server/uploads/
      const uploadsDir = path.join(__dirname, "../uploads");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const safeFilename = `${req.user._id}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
      const localFilePath = path.join(uploadsDir, safeFilename);

      await fs.promises.writeFile(localFilePath, req.file.buffer);

      const prescription = await Prescription.create({
        userId:       req.user._id,
        originalName: req.file.originalname,
        storedName:   safeFilename,
        fileType:     ext,
        note,
        category,
        description,
        cloudinaryUrl: null, // null means stored locally
        cloudinaryPublicId: null,
      });

      res.status(201).json({ success: true, prescription });
    }
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
      // Local fallback: serve local file
      const uploadsDir = path.join(__dirname, "../uploads");
      const localPath = path.join(uploadsDir, item.storedName);
      if (!fs.existsSync(localPath)) {
        return res.status(404).json({ success: false, message: "Local file not found on server." });
      }

      const mimeTypes = {
        pdf: "application/pdf",
        png: "image/png",
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        webp: "image/webp",
      };
      const contentType = mimeTypes[item.fileType] || "application/octet-stream";

      res.setHeader("Content-Type", contentType);
      res.setHeader("Content-Disposition", `attachment; filename="${item.originalName}"`);
      return res.sendFile(localPath);
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
    } else if (item.storedName) {
      // Local fallback: delete local file from uploads
      const uploadsDir = path.join(__dirname, "../uploads");
      const localPath = path.join(uploadsDir, item.storedName);
      if (fs.existsSync(localPath)) {
        await fs.promises.unlink(localPath);
      }
    }

    await item.deleteOne();
    res.json({ success: true, message: "Prescription deleted." });
  } catch (err) {
    console.error("[Delete Prescription Error]", err.message);
    res.status(500).json({ success: false, message: "Failed to delete prescription." });
  }
};

module.exports = { uploadPrescription, getPrescriptions, getPrescriptionFile, deletePrescription };
