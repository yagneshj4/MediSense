const express = require("express");
const multer  = require("multer");
const path    = require("path");
const { v4: uuidv4 } = require("uuid");
const { protect } = require("../middleware/authMiddleware");
const {
  uploadPrescription,
  getPrescriptions,
  getPrescriptionFile,
  deletePrescription,
} = require("../controllers/prescriptionController");

// Multer storage — per-user directories
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../uploads", String(req.user._id));
    require("fs").mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${req.user._id}_${uuidv4()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = [".png", ".jpg", ".jpeg", ".webp", ".pdf"];
  const ext = path.extname(file.originalname).toLowerCase();
  cb(null, allowed.includes(ext));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 8 * 1024 * 1024 } });

const router = express.Router();
router.use(protect);

router.post("/upload", upload.single("file"), uploadPrescription);
router.get("/",                                getPrescriptions);
router.get("/:id/file",                        getPrescriptionFile);
router.delete("/:id",                          deletePrescription);

module.exports = router;
