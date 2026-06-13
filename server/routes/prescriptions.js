const express = require("express");
const multer  = require("multer");
const path    = require("path");
const { protect } = require("../middleware/authMiddleware");
const {
  uploadPrescription,
  getPrescriptions,
  getPrescriptionFile,
  deletePrescription,
} = require("../controllers/prescriptionController");

// Use memory storage to avoid writing local files
const storage = multer.memoryStorage();

// Basic file filter (checks original file extension first as a fast filter)
const fileFilter = (req, file, cb) => {
  const allowedExts = [".png", ".jpg", ".jpeg", ".webp", ".pdf"];
  const ext = path.extname(file.originalname).toLowerCase();
  cb(null, allowedExts.includes(ext));
};

const upload = multer({ 
  storage, 
  fileFilter, 
  limits: { fileSize: 8 * 1024 * 1024 } // 8MB size limit
});

// Middleware to perform deep magic bytes validation using file-type
const validateMagicBytes = async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "Please upload a file." });
  }

  try {
    const fileType = require("file-type");
    const type = await fileType.fromBuffer(req.file.buffer);
    
    if (!type) {
      return res.status(400).json({ success: false, message: "Invalid file type. Spoofed file content detected." });
    }

    const allowedMimeTypes = ["image/png", "image/jpeg", "image/webp", "application/pdf"];
    
    if (!allowedMimeTypes.includes(type.mime)) {
      return res.status(400).json({ 
        success: false, 
        message: `File content type (${type.mime}) is not allowed. Only JPEG, PNG, WEBP, and PDF files are permitted.` 
      });
    }

    // Attach validated details to file object
    req.file.validatedMime = type.mime;
    req.file.validatedExt = type.ext;
    
    next();
  } catch (err) {
    console.error("[File Validation Error]", err.message);
    res.status(400).json({ success: false, message: "Error validating file signature." });
  }
};

const router = express.Router();
router.use(protect);

router.post("/upload", upload.single("file"), validateMagicBytes, uploadPrescription);
router.get("/",                                getPrescriptions);
router.get("/:id/file",                        getPrescriptionFile);
router.delete("/:id",                          deletePrescription);

module.exports = router;
