const { getGeminiResponse } = require("../utils/gemini");
const ChatHistory = require("../models/ChatHistory");

const EMERGENCY_PATTERNS = [
  "severe chest pain","chest pain and sweating","can't breathe","cannot breathe",
  "difficulty breathing","shortness of breath","fainting","unconscious","stroke",
  "face drooping","slurred speech","heavy bleeding","suicide","suicidal","kill myself","self harm",
];

function detectEmergency(text) {
  const lower = text.toLowerCase();
  return EMERGENCY_PATTERNS.some((p) => lower.includes(p));
}



// POST /api/chat
const sendMessage = async (req, res) => {
  const { message, lastDisease, lang = "en", context = [], sessionId } = req.body;

  if (!message?.trim())
    return res.status(400).json({ success: false, message: "Message cannot be empty." });

  // Emergency check
  if (detectEmergency(message)) {
    return res.json({
      success: true,
      response: {
        text: "🚨 Emergency Warning: Your message may describe a serious medical emergency. Please call 108 immediately or go to the nearest emergency department. Do not wait for an AI response.",
        type: "emergency",
      },
    });
  }

  // Retrieve Gemini AI response
  let responseText = await getGeminiResponse(message, lang, lastDisease, context);
  let responseType = "gemini";

  if (!responseText) {
    responseText = "⚠️ MediBot (Gemini AI) is currently unavailable. Please check that the GEMINI_API_KEY environment variable is configured correctly and try again.";
    responseType = "error";
  }

  // Save to chat history if user is authenticated and response was successful (not an error)
  if (req.user && responseType !== "error") {
    try {
      let history = await ChatHistory.findOne({ userId: req.user._id });
      if (!history) {
        history = new ChatHistory({ userId: req.user._id, messages: [], lang });
      }
      history.messages.push({ role: "user", text: message });
      history.messages.push({ role: "bot",  text: responseText });
      history.lastDisease = lastDisease || history.lastDisease;
      history.lang = lang;

      // Keep last 100 messages to avoid bloat
      if (history.messages.length > 100) {
        history.messages = history.messages.slice(-100);
      }
      await history.save();
    } catch (err) {
      console.warn("[Chat History Save Error]", err.message);
    }
  }

  res.json({
    success: true,
    response: { text: responseText, type: responseType },
  });
};

// GET /api/chat/history  (protected)
const getChatHistory = async (req, res) => {
  const history = await ChatHistory.findOne({ userId: req.user._id });
  res.json({ success: true, messages: history?.messages || [], lastDisease: history?.lastDisease || null });
};

// DELETE /api/chat/history  (protected)
const clearChatHistory = async (req, res) => {
  await ChatHistory.findOneAndUpdate({ userId: req.user._id }, { messages: [], lastDisease: null });
  res.json({ success: true, message: "Chat history cleared." });
};

module.exports = { sendMessage, getChatHistory, clearChatHistory };
