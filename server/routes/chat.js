const express = require("express");
const { sendMessage, getChatHistory, clearChatHistory } = require("../controllers/chatController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// sendMessage works for both auth and anon users (history only saved when auth'd)
router.post("/", (req, res, next) => {
  // Optionally attach user if token present, but don't reject if missing
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    const jwt = require("jsonwebtoken");
    const User = require("../models/User");
    try {
      const decoded = jwt.verify(authHeader.split(" ")[1], process.env.JWT_SECRET);
      User.findById(decoded.id)
        .select("-password")
        .then((user) => { req.user = user; next(); })
        .catch(() => next());
    } catch { next(); }
  } else {
    next();
  }
}, sendMessage);

router.get("/history", protect, getChatHistory);
router.delete("/history", protect, clearChatHistory);

module.exports = router;
