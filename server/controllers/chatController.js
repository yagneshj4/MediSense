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

const RULE_BASED = {
  hello: "Hello! I'm MediBot 👋 Ask me about symptoms, medicines, or general health tips. How can I help you today?",
  hi:    "Hi there! I'm MediBot. Ready to help with your health questions 😊",
  fever: "Fever (temperature >38°C/100.4°F) often signals infection. Rest, stay hydrated, and take paracetamol if needed. See a doctor if it lasts >3 days or goes above 39.5°C.",
  headache: "Headaches can result from dehydration, stress, or lack of sleep. Drink water, rest, and avoid bright screens. Consult a doctor for severe or sudden headaches.",
  cough: "Coughs can be caused by a viral infection, allergies, or irritants. Stay hydrated and consider honey+ginger tea. See a doctor if it persists >2 weeks or produces blood.",
  cold: "Common cold symptoms usually resolve in 7–10 days. Rest, fluids, and steam inhalation help. Antibiotics won't work — it's a virus.",
  "blood pressure": "High blood pressure (hypertension) requires lifestyle changes and possibly medication. Reduce salt, exercise regularly, and consult your doctor.",
  diabetes: "Diabetes management involves blood sugar monitoring, a healthy diet, regular exercise, and prescribed medications. Never adjust doses without doctor guidance.",
  default: "I'm MediBot 🤖 I provide general health information only. For accurate diagnosis, please use the Symptom Checker or consult a qualified doctor. What health topic can I help you with?",
};

function getRuleBasedResponse(message) {
  const lower = message.toLowerCase();
  for (const [key, val] of Object.entries(RULE_BASED)) {
    if (key !== "default" && lower.includes(key)) return val;
  }
  return RULE_BASED.default;
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

  // Try Gemini AI first, fall back to rule-based
  let responseText = await getGeminiResponse(message, lang, lastDisease, context);
  let responseType = "gemini";

  if (!responseText) {
    responseText = getRuleBasedResponse(message);
    responseType = "rule";
  }

  // Save to chat history if user is authenticated
  if (req.user) {
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
