import os
from collections import Counter
from datetime import datetime, timedelta, timezone
from typing import Any

from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel

app = FastAPI(title="CAMPUSSHIELD Analytics", version="0.2.0")

class HealthResponse(BaseModel):
    service: str
    status: str
    phase: str

class AnalyzeRequest(BaseModel):
    report: dict[str, Any]
    recentReports: list[dict[str, Any]] = []

def validate_secret(secret: str | None) -> None:
    expected = os.getenv('ANALYTICS_SECRET')
    if expected and secret != expected:
        raise HTTPException(status_code=401, detail='Invalid analytics service secret')

@app.get('/health', response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(service='campusshield-analytics', status='ok', phase='auth-and-reports')

@app.post('/analyze')
def analyze(payload: AnalyzeRequest, x_analytics_secret: str | None = Header(default=None)) -> dict[str, Any]:
    validate_secret(x_analytics_secret)
    report = payload.report
    reports = payload.recentReports
    hostel = report.get('hostel')
    block = report.get('block')
    symptoms = set(report.get('symptoms', []))
    now = datetime.now(timezone.utc)
    recent_same_area = []
    symptom_overlap = 0
    exposure_counter: Counter[str] = Counter()

    for item in reports:
      created = item.get('createdAt')
      if created:
        try:
          created_dt = datetime.fromisoformat(str(created).replace('Z', '+00:00'))
          if created_dt < now - timedelta(days=7):
            continue
        except ValueError:
          pass
      if item.get('hostel') == hostel and item.get('block') == block:
        recent_same_area.append(item)
      item_symptoms = set(item.get('symptoms', []))
      if symptoms and item_symptoms and symptoms.intersection(item_symptoms):
        symptom_overlap += 1
      exposure = item.get('exposure') or {}
      meal = exposure.get('meal')
      mess = exposure.get('mess')
      water = exposure.get('waterSource')
      if meal and mess:
        exposure_counter[f'{mess} {meal}'] += 1
      if water:
        exposure_counter[f'{water} water'] += 1

    area_cases = len(recent_same_area)
    temporal_score = min(len(reports) / 20, 1)
    spatial_score = min(area_cases / 8, 1)
    symptom_score = min(symptom_overlap / max(len(reports), 1), 1)
    exposure_score = min((exposure_counter.most_common(1)[0][1] if exposure_counter else 0) / max(len(reports), 1), 1)
    confidence = round((0.25 * temporal_score + 0.25 * spatial_score + 0.2 * symptom_score + 0.3 * exposure_score) * 100)
    risk = 'NORMAL'
    if confidence >= 70:
      risk = 'HIGH_CONFIDENCE'
    elif confidence >= 50:
      risk = 'SUSPICIOUS'
    elif confidence >= 30:
      risk = 'WATCH'

    leading = exposure_counter.most_common(1)[0][0] if exposure_counter else None
    evidence = [
      f'{len(reports)} recent report(s) in the seven-day analysis window',
      f'{area_cases} recent report(s) share hostel/block location',
      f'{symptom_overlap} report(s) overlap symptom categories',
    ]
    if leading:
      evidence.append(f'Leading suspected exposure association: {leading}')

    return {
      'available': True,
      'riskLevel': risk,
      'confidence': confidence,
      'leadingSuspectedExposure': leading,
      'evidence': evidence,
      'componentScores': {
        'temporal': temporal_score,
        'spatial': spatial_score,
        'symptoms': symptom_score,
        'exposure': exposure_score,
      },
    }
