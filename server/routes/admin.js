const express = require("express");
const { getAdminAnalytics } = require("../controllers/adminController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Middleware to restrict access to admins only
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ success: false, message: "Access denied. Admin rights required." });
  }
};

router.get("/analytics", protect, adminOnly, getAdminAnalytics);

module.exports = router;
