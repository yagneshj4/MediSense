require("dotenv").config({ path: __dirname + "/../.env" });
const mongoose = require("mongoose");
const User = require("../models/User");

const email = process.argv[2];

if (!email) {
  console.error("Usage: node scripts/seedAdmin.js <email>");
  process.exit(1);
}

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/mediassist";

async function promote() {
  try {
    console.log(`Connecting to database...`);
    await mongoose.connect(MONGO_URI);
    console.log("Database connected.");

    console.log(`Searching for user with email: ${email}...`);
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      console.error(`Error: User with email ${email} not found. Please register the user first.`);
      process.exit(1);
    }

    if (user.role === "admin") {
      console.log(`User ${email} is already an admin.`);
      process.exit(0);
    }

    user.role = "admin";
    await user.save();

    console.log(`Success! User ${email} has been promoted to 'admin'.`);
    process.exit(0);
  } catch (err) {
    console.error("An error occurred during promotion:", err.message);
    process.exit(1);
  }
}

promote();
