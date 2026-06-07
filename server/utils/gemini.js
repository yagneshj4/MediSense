const axios = require("axios");

const LANGUAGE_NAMES = { en: "English", hi: "Hindi", bn: "Bengali" };
const DEFAULT_MODEL = "gemini-2.5-flash-lite";

function buildSystemPrompt(lang, lastDisease, context) {
  const language = LANGUAGE_NAMES[lang] || "English";
  const ctx = lastDisease ? `The user's last predicted condition is ${lastDisease}.` : "";
  let history = "";
  if (context?.length) {
    history =
      "\nRecent chat context:\n" +
      context
        .slice(-6)
        .map((m) => `${m.role}: ${String(m.text).slice(0, 220)}`)
        .join("\n");
  }

  return `You are MediBot, the friendly AI chat assistant inside Medi-Assist.
Reply in ${language}.

Important safety rules:
- Give general health education only.
- Do not claim to diagnose, prescribe, or replace a doctor.
- If the user reports emergency symptoms such as severe chest pain, trouble breathing, fainting, stroke symptoms, heavy bleeding, or suicidal thoughts, tell them to seek emergency medical help immediately.
- Keep answers short, clear, and practical.
- If the user asks about symptoms, suggest they use Medi-Assist symptom prediction.
- For medicines, advise consulting a qualified doctor or pharmacist before taking anything.

${ctx}
${history}`.trim();
}

async function getGeminiResponse(message, lang = "en", lastDisease = null, context = []) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "your_google_ai_studio_api_key") return null;

  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const payload = {
    systemInstruction: { parts: [{ text: buildSystemPrompt(lang, lastDisease, context) }] },
    contents: [{ role: "user", parts: [{ text: message }] }],
    generationConfig: { temperature: 0.4, topP: 0.9, maxOutputTokens: 420 },
  };

  try {
    const res = await axios.post(url, payload, {
      headers: { "Content-Type": "application/json" },
      timeout: 20000,
    });
    const parts = res.data?.candidates?.[0]?.content?.parts || [];
    return parts.map((p) => p.text || "").join("\n").trim() || null;
  } catch (err) {
    console.error("[Gemini Error]", err.message);
    return null;
  }
}

async function getStructuredHealthReport(disease, symptoms, confidence) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "your_google_ai_studio_api_key") {
    // Return a default formatted mock report if API key is missing
    return {
      patientSummary: `Patient presenting with ${symptoms.join(", ")}. Primary diagnosis suggests ${disease} with ${confidence}% match.`,
      diagnosis: disease,
      severity: confidence >= 80 ? "High" : confidence >= 55 ? "Medium" : "Low",
      precautions: ["Rest and stay hydrated", "Monitor symptoms closely"],
      recommendedDiet: ["Light, easily digestible meals", "Plenty of fluids"],
      recommendedSpecialist: "General Physician",
      emergencySigns: ["Difficulty breathing", "Persistent high fever", "Chest pain"],
      disclaimer: "Disclaimer: This is an automatically generated AI report. Please consult a doctor for official medical advice."
    };
  }

  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const prompt = `You are a medical report generator. Given the following details:
- Predicted disease: ${disease}
- Symptoms: ${symptoms.join(', ')}
- Confidence: ${confidence}%

Generate a structured health report in JSON format:
{
  "patientSummary": "A detailed clinical summary of the patient's state based on reported symptoms.",
  "diagnosis": "${disease}",
  "severity": "${confidence >= 80 ? "High" : confidence >= 55 ? "Medium" : "Low"}",
  "precautions": ["Precaution 1", "Precaution 2", "Precaution 3"],
  "recommendedDiet": ["Diet suggestion 1", "Diet suggestion 2"],
  "recommendedSpecialist": "Type of medical specialist (e.g. Cardiologist, Dermatologist, Pulmonologist) to consult.",
  "emergencySigns": ["Warning sign 1", "Warning sign 2"],
  "disclaimer": "Standard disclaimer about AI medical reports."
}
Return ONLY valid JSON. Do not wrap in markdown code blocks or backticks.`;

  const payload = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 1000,
      responseMimeType: "application/json"
    },
  };

  try {
    const res = await axios.post(url, payload, {
      headers: { "Content-Type": "application/json" },
      timeout: 25000,
    });
    const parts = res.data?.candidates?.[0]?.content?.parts || [];
    const text = parts.map((p) => p.text || "").join("\n").trim();
    return JSON.parse(text);
  } catch (err) {
    console.error("[Gemini Report Error]", err.message);
    // Return safe fallback
    return {
      patientSummary: `Patient presenting with ${symptoms.join(", ")}. Primary diagnosis suggests ${disease} with ${confidence}% match.`,
      diagnosis: disease,
      severity: confidence >= 80 ? "High" : confidence >= 55 ? "Medium" : "Low",
      precautions: ["Rest and stay hydrated", "Monitor symptoms closely"],
      recommendedDiet: ["Light, easily digestible meals", "Plenty of fluids"],
      recommendedSpecialist: "General Physician",
      emergencySigns: ["Difficulty breathing", "Persistent high fever", "Chest pain"],
      disclaimer: "Disclaimer: Failed to contact AI service. This is a local fallback report. Please consult a doctor for official medical advice."
    };
  }
}

module.exports = { getGeminiResponse, getStructuredHealthReport };
