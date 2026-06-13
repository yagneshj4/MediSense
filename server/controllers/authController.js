const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });

// POST /api/auth/register
const register = async (req, res) => {
  const { name, email, password, role, adminSecret } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ success: false, message: "All fields are required." });

  if (password.length < 6)
    return res.status(400).json({ success: false, message: "Password must be at least 6 characters." });

  const exists = await User.findOne({ email });
  if (exists)
    return res.status(409).json({ success: false, message: "Email is already registered." });

  let assignedRole = "user";
  if (role === "admin") {
    if (adminSecret && adminSecret === process.env.ADMIN_SECRET_KEY) {
      assignedRole = "admin";
    } else {
      return res.status(403).json({ success: false, message: "Invalid or missing admin secret key." });
    }
  }

  const hashed = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, password: hashed, role: assignedRole });
  const token = signToken(user._id);

  res.status(201).json({
    success: true,
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt },
  });
};

// POST /api/auth/login
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ success: false, message: "Email and password are required." });

  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password)))
    return res.status(401).json({ success: false, message: "Invalid email or password." });

  const token = signToken(user._id);

  res.json({
    success: true,
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt },
  });
};

// GET /api/auth/me  (protected)
const getMe = async (req, res) => {
  res.json({
    success: true,
    user: { id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role, createdAt: req.user.createdAt },
  });
};

module.exports = { register, login, getMe };
