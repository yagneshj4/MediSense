import os
import sys
import pytest

# Adjust paths to import ml_server
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BASE_DIR)

from ml_server import app

@pytest.fixture
def client():
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client

def test_health_endpoint(client):
    res = client.get("/ml/health")
    assert res.status_code == 200
    json_data = res.get_json()
    assert json_data["status"] == "ok"
    assert json_data["service"] == "ml"

def test_symptoms_endpoint(client):
    res = client.get("/ml/symptoms")
    assert res.status_code == 200
    json_data = res.get_json()
    assert "symptoms" in json_data
    assert len(json_data["symptoms"]) > 0
    assert "headache" in json_data["symptoms"]

def test_predict_endpoint_valid(client):
    payload = {"symptoms": ["itching", "skin_rash"]}
    res = client.post("/ml/predict", json=payload)
    assert res.status_code == 200
    json_data = res.get_json()
    assert "disease" in json_data
    assert "confidence" in json_data
    assert "precautions" in json_data

def test_predict_endpoint_empty_symptoms(client):
    payload = {"symptoms": []}
    res = client.post("/ml/predict", json=payload)
    assert res.status_code == 400
    json_data = res.get_json()
    assert "error" in json_data
    assert json_data["error"] == "No recognizable symptoms provided."

def test_predict_endpoint_emergency(client):
    payload = {"symptoms": ["severe chest pain", "can't breathe"]}
    res = client.post("/ml/predict", json=payload)
    assert res.status_code == 200
    json_data = res.get_json()
    assert "emergency" in json_data
    assert json_data["emergency"] is True
    assert "error" in json_data
    assert "Emergency warning" in json_data["error"]
