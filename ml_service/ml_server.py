"""
Medi-Assist — Python ML Microservice
Exposes only:
  POST /ml/predict   → disease prediction via SVC
  GET  /ml/symptoms  → full symptom list
Internal service only — not exposed to the public.
"""
import os
import sys

# Resolve paths relative to this file so the service can be run from any cwd
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE_DIR)

from flask import Flask, jsonify, request
from flask_cors import CORS

from app.data   import helper, severity_map as _sev_ref
from app.model  import get_top3_predictions, severity_map as model_sev, symptoms_dict
from app.nlp    import extract_symptoms_from_text
from app.safety import confidence_note, detect_emergency, emergency_message

import app.model as _model_mod
import app.data  as _data_mod
_model_mod.severity_map = _data_mod.severity_map

app = Flask(__name__)
CORS(app)  # Express backend is on a different port


@app.route("/ml/health")
def health():
    return jsonify({"status": "ok", "service": "ml"})


@app.route("/ml/symptoms")
def symptoms_list():
    readable = sorted(s.replace("_", " ") for s in symptoms_dict.keys())
    return jsonify({"symptoms": readable})


@app.route("/ml/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json(force=True) or {}
        raw_symptoms = data.get("symptoms", [])

        # Emergency guard
        emergency = detect_emergency(" ".join(str(i) for i in raw_symptoms))
        if emergency:
            return jsonify({
                "error": emergency_message("en"),
                "emergency": True,
            })

        # Normalize + extract symptoms
        symptoms = []
        for item in raw_symptoms:
            canonical = str(item).strip().lower().replace(" ", "_")
            if canonical in symptoms_dict:
                symptoms.append(canonical)
            else:
                symptoms.extend(extract_symptoms_from_text(str(item).replace("_", " ")))

        symptoms = list(dict.fromkeys(symptoms))

        if not symptoms:
            return jsonify({"error": "No recognizable symptoms provided."}), 400

        top3, unrecognized = get_top3_predictions(symptoms)

        if not top3:
            return jsonify({"error": "None of the symptoms were recognized by the model."}), 400

        primary = top3[0]
        disease = primary["disease"]
        desc, pre, med, die, wrk = helper(disease)

        return jsonify({
            "disease":         disease,
            "confidence":      primary["confidence"],
            "severity":        primary["severity"],
            "confidence_note": confidence_note(primary["confidence"]),
            "top3":            top3,
            "description":     desc,
            "precautions":     pre,
            "medication":      med,
            "diet":            die,
            "workout":         wrk,
            "unrecognized":    unrecognized,
        })

    except Exception as exc:
        print(f"[ML ERROR] {exc}")
        return jsonify({"error": str(exc)}), 500


if __name__ == "__main__":
    port = int(os.environ.get("ML_PORT", 8000))
    print(f"[ML Service] Starting on http://0.0.0.0:{port}")
    app.run(host="0.0.0.0", port=port, debug=False)
