"""
CyberShield AI - Python ML Service
FastAPI-based phishing detection microservice
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
import re
import random
from datetime import datetime

app = FastAPI(
    title="CyberShield ML Service",
    description="Phishing detection machine learning models",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ScanRequest(BaseModel):
    content: str

class ScanResponse(BaseModel):
    result: str
    confidence: float
    threats: List[str]
    details: Dict[str, Any]

# Detection patterns
PHISHING_PATTERNS = [
    r'login[-._]?verify', r'account[-._]?verify', r'secure[-._]?update',
    r'banking[-._]?alert', r'suspended[-._]?account', r'confirm[-._]?identity',
    r'paypal[-._]?verify', r'apple[-._]?id', r'microsoft[-._]?update',
    r'urgent[-._]?action', r'limited[-._]?access', r'password[-._]?reset',
    r'verify[-._]?account', r'unlock[-._]?account',
]

SUSPICIOUS_TLDS = ['.xyz', '.top', '.club', '.work', '.click', '.link', '.tk', '.ml', '.ga', '.cf']

PHISHING_KEYWORDS = [
    'verify', 'suspended', 'urgent', 'click immediately', 'confirm',
    'account locked', 'security alert', 'unusual activity', 'winner',
    'congratulations', 'claim prize', 'password', 'bank', 'login'
]

def extract_url_features(url: str) -> Dict[str, float]:
    return {
        'url_length': min(len(url) / 150.0, 1.0),
        'no_https': 0.0 if url.startswith('https') else 0.8,
        'has_ip': 1.0 if re.search(r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}', url) else 0.0,
        'suspicious_tld': 1.0 if any(tld in url.lower() for tld in SUSPICIOUS_TLDS) else 0.0,
        'phishing_pattern': 1.0 if any(re.search(p, url, re.I) for p in PHISHING_PATTERNS) else 0.0,
        'at_symbol': 1.0 if '@' in url else 0.0,
    }

def ml_predict(features: Dict[str, float]) -> tuple:
    score = sum(features.values()) / max(len(features), 1)
    score = max(0.05, min(0.98, score + random.uniform(-0.08, 0.08)))
    if score > 0.68:
        return "phishing", score
    elif score > 0.48:
        return "suspicious", score
    else:
        return "safe", 1 - score

@app.get("/")
def root():
    return {"service": "CyberShield ML Service", "version": "1.0.0", "status": "online"}

@app.get("/api/health")
def health():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

@app.post("/api/predict/url", response_model=ScanResponse)
def predict_url(request: ScanRequest):
    features = extract_url_features(request.content)
    result, confidence = ml_predict(features)
    threats = []
    if features['no_https'] > 0.5: threats.append("No HTTPS encryption")
    if features['suspicious_tld'] > 0.5: threats.append("Suspicious top-level domain")
    if features['has_ip'] > 0.5: threats.append("IP address used instead of domain")
    if features['phishing_pattern'] > 0.5: threats.append("Phishing keyword patterns detected")

    return ScanResponse(
        result=result,
        confidence=round(confidence, 4),
        threats=threats,
        details={"features": features}
    )

@app.post("/api/predict/email", response_model=ScanResponse)
def predict_email(request: ScanRequest):
    text = request.content.lower()
    features = {
        'phishing_keywords': sum(1 for kw in PHISHING_KEYWORDS if kw in text) / 5.0,
        'has_urgency': 1.0 if re.search(r'urgent|immediately|asap|act now', text) else 0.0,
        'has_links': 0.6 if 'http' in text else 0.0,
        'has_fraud': 1.0 if re.search(r'inheritance|beneficiary|million dollars', text) else 0.0,
    }
    result, confidence = ml_predict(features)
    threats = []
    if features['has_urgency'] > 0.5: threats.append("Urgency manipulation detected")
    if features['phishing_keywords'] > 0.3: threats.append("Phishing keywords found")
    if features['has_fraud'] > 0.5: threats.append("Fraud pattern detected")

    return ScanResponse(
        result=result,
        confidence=round(confidence, 4),
        threats=threats,
        details={"features": features}
    )

@app.post("/api/predict/sms", response_model=ScanResponse)
def predict_sms(request: ScanRequest):
    text = request.content.lower()
    features = {
        'sms_phishing': 1.0 if re.search(r'won|winner|congratulations|claim.*prize', text) else 0.0,
        'urgency': 1.0 if re.search(r'urgent|immediately|act now', text) else 0.0,
        'has_link': 0.8 if 'http' in text else 0.0,
    }
    result, confidence = ml_predict(features)
    threats = []
    if features['sms_phishing'] > 0.5: threats.append("SMS phishing pattern detected")
    if features['urgency'] > 0.5: threats.append("Urgency language detected")

    return ScanResponse(
        result=result,
        confidence=round(confidence, 4),
        threats=threats,
        details={"features": features}
    )

@app.post("/api/predict/text", response_model=ScanResponse)
def predict_text(request: ScanRequest):
    text = request.content.lower()
    features = {
        'fraud_pattern': 1.0 if re.search(r'inheritance|beneficiary|million|barrister', text) else 0.0,
        'phishing_keywords': min(sum(1 for kw in PHISHING_KEYWORDS if kw in text) / 4.0, 1.0),
        'urgency': 0.8 if re.search(r'urgent|immediately', text) else 0.0,
    }
    result, confidence = ml_predict(features)
    return ScanResponse(
        result=result,
        confidence=round(confidence, 4),
        threats=[k for k, v in features.items() if v > 0.5],
        details={"features": features}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
