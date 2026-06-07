const Prediction = require("../models/Prediction");
const { getStructuredHealthReport } = require("../utils/gemini");
const PDFDocument = require("pdfkit");

// POST /api/predictions/save (protected)
const savePrediction = async (req, res) => {
  const { symptoms, predictedDisease, confidence, precautions } = req.body;

  if (!predictedDisease || !symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
    return res.status(400).json({ success: false, message: "Invalid prediction data provided." });
  }

  try {
    const prediction = await Prediction.create({
      userId: req.user._id,
      symptoms,
      predictedDisease,
      confidence,
      precautions: precautions || [],
    });
    res.status(201).json({ success: true, prediction });
  } catch (err) {
    console.error("[Save Prediction Error]", err.message);
    res.status(500).json({ success: false, message: "Failed to save prediction record." });
  }
};

// GET /api/predictions/history/:userId (protected)
const getPredictionHistory = async (req, res) => {
  try {
    const targetUserId = req.params.userId || req.user._id;

    // Security: Only allow users to view their own history
    if (String(targetUserId) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Unauthorized access." });
    }

    const list = await Prediction.find({ userId: targetUserId }).sort({ createdAt: -1 });
    res.json({ success: true, predictions: list });
  } catch (err) {
    console.error("[Get History Error]", err.message);
    res.status(500).json({ success: false, message: "Failed to retrieve prediction history." });
  }
};

// GET /api/predictions/:id/report (protected)
const generatePDFReport = async (req, res) => {
  try {
    const prediction = await Prediction.findOne({ _id: req.params.id, userId: req.user._id });

    if (!prediction) {
      return res.status(404).json({ success: false, message: "Prediction record not found." });
    }

    // Call Gemini to generate a structured report
    console.log(`Generating report for disease: ${prediction.predictedDisease}...`);
    const reportData = await getStructuredHealthReport(
      prediction.predictedDisease,
      prediction.symptoms,
      prediction.confidence
    );

    if (!reportData) {
      return res.status(500).json({ success: false, message: "Failed to generate report content." });
    }

    // Initialize PDF document
    const doc = new PDFDocument({ margin: 50, size: "A4" });

    // Set Response Headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Medi_Assist_Report_${prediction._id}.pdf`
    );

    // Pipe PDF doc directly to express response
    doc.pipe(res);

    // Color Palette
    const cDark = "#0f172a";
    const cTeal = "#0d9488";
    const cSlate = "#475569";
    const cLightBg = "#f8fafc";
    const cRed = "#ef4444";

    // ── Header ──
    doc.fillColor(cTeal).font("Helvetica-Bold").fontSize(26).text("MEDI-ASSIST", { align: "left" });
    doc.fillColor(cDark).font("Helvetica").fontSize(10).text("AI-POWERED HEALTHCARE PLATFORM", doc.x, doc.y - 5);
    doc.moveDown(0.5);

    // Line separator
    doc.strokeColor(cTeal).lineWidth(2).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(1.2);

    // ── Document Metadata ──
    doc.fillColor(cDark).font("Helvetica-Bold").fontSize(14).text("CLINICAL DIAGNOSIS REPORT");
    doc.moveDown(0.4);

    doc.font("Helvetica").fontSize(9).fillColor(cSlate);
    doc.text(`Patient ID:     ${req.user._id}`);
    doc.text(`Patient Name:   ${req.user.name}`);
    doc.text(`Diagnosis ID:   ${prediction._id}`);
    doc.text(`Report Date:    ${new Date(prediction.createdAt).toLocaleDateString("en-IN", { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`);
    doc.moveDown(1.5);

    // ── Reported Symptoms ──
    doc.fillColor(cDark).font("Helvetica-Bold").fontSize(11).text("Reported Symptoms");
    doc.moveDown(0.3);
    doc.font("Helvetica").fontSize(9.5).fillColor(cSlate).text(prediction.symptoms.map(s => s.replace("_", " ")).join(", "));
    doc.moveDown(1.5);

    // ── Diagnosis Details ──
    doc.fillColor(cDark).font("Helvetica-Bold").fontSize(11).text("AI Diagnosis Details");
    doc.moveDown(0.4);

    // Draw shaded background box for diagnosis
    const boxTop = doc.y;
    doc.fillColor(cLightBg).rect(50, boxTop, 495, 65).fill();
    doc.fillColor(cDark);

    doc.font("Helvetica-Bold").fontSize(10.5).text(`Predicted Condition: `, 65, boxTop + 12);
    doc.font("Helvetica").fontSize(10.5).text(prediction.predictedDisease, 175, boxTop + 12);

    doc.font("Helvetica-Bold").fontSize(10.5).text(`Match Confidence: `, 65, boxTop + 28);
    doc.font("Helvetica").fontSize(10.5).fillColor(cTeal).text(`${prediction.confidence}%`, 175, boxTop + 28);

    doc.font("Helvetica-Bold").fillColor(cDark).fontSize(10.5).text(`Severity Level: `, 65, boxTop + 44);
    doc.font("Helvetica").fontSize(10.5).text(reportData.severity || "Low", 175, boxTop + 44);

    doc.y = boxTop + 80;
    doc.moveDown(0.8);

    // ── Patient Clinical Summary ──
    doc.fillColor(cDark).font("Helvetica-Bold").fontSize(11).text("Clinical Summary");
    doc.moveDown(0.4);
    doc.font("Helvetica").fontSize(9.5).fillColor(cSlate).text(reportData.patientSummary || "N/A", { align: "justify", lineGap: 3 });
    doc.moveDown(1.5);

    // ── Recommended Specialist ──
    doc.fillColor(cDark).font("Helvetica-Bold").fontSize(11).text("Recommended Specialist");
    doc.moveDown(0.4);
    doc.font("Helvetica").fontSize(9.5).fillColor(cSlate).text(reportData.recommendedSpecialist || "General Physician");
    doc.moveDown(1.5);

    // ── Precautions & Diet ──
    doc.fillColor(cDark).font("Helvetica-Bold").fontSize(11).text("Clinical Precautions");
    doc.moveDown(0.4);
    const precs = reportData.precautions || prediction.precautions || [];
    precs.forEach((p) => {
      doc.font("Helvetica").fontSize(9.5).fillColor(cSlate).text(`•  ${p}`);
    });
    doc.moveDown(1.5);

    doc.fillColor(cDark).font("Helvetica-Bold").fontSize(11).text("Dietary & Nutrition Recommendations");
    doc.moveDown(0.4);
    const diets = reportData.recommendedDiet || [];
    diets.forEach((d) => {
      doc.font("Helvetica").fontSize(9.5).fillColor(cSlate).text(`•  ${d}`);
    });
    doc.moveDown(1.5);

    // ── Critical Warning Signs ──
    if (reportData.emergencySigns && reportData.emergencySigns.length > 0) {
      doc.fillColor(cRed).font("Helvetica-Bold").fontSize(11).text("🚨 Critical Emergency Symptoms to Monitor");
      doc.moveDown(0.4);
      reportData.emergencySigns.forEach((s) => {
        doc.font("Helvetica").fontSize(9.5).fillColor(cRed).text(`•  ${s}`);
      });
      doc.moveDown(1.5);
    }

    // ── Disclaimer ──
    doc.strokeColor("#e2e8f0").lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.8);
    doc.fillColor("#94a3b8").font("Helvetica-Oblique").fontSize(8).text(reportData.disclaimer || "Disclaimer: This report is generated by an artificial intelligence assistant for educational purposes only. It is not a replacement for professional medical advice, diagnosis, or treatment. Always consult a qualified medical professional.", { align: "center", lineGap: 2 });

    doc.end();
  } catch (err) {
    console.error("[Generate PDF Error]", err.message);
    res.status(500).json({ success: false, message: "Failed to compile medical report PDF." });
  }
};

module.exports = { savePrediction, getPredictionHistory, generatePDFReport };
