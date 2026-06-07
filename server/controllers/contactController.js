const ContactMessage = require("../models/ContactMessage");

// POST /api/contact
const submitContact = async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message)
    return res.status(400).json({ success: false, message: "Name, email, and message are required." });

  await ContactMessage.create({ name, email, subject: subject || "General", message });

  res.status(201).json({ success: true, message: "Your message has been received. We will get back to you soon!" });
};

module.exports = { submitContact };
