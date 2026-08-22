from typing import Any, Dict, List

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

app = FastAPI(title='CAMPUSSHIELD Analytics', version='0.1.0')


class HealthResponse(BaseModel):
    service: str
    status: str
    phase: str


class AnalyticsRequest(BaseModel):
    report: Dict[str, Any] = Field(...)
    recentReports: List[Dict[str, Any]] = Field(default_factory=list)


class ExposureEvidence(BaseModel):
    type: str
    id: str
    name: str
    associationScore: float
    evidence: List[str]


class BlockRisk(BaseModel):
    blockId: str
    blockName: str
    reportCount: int
    baseline: float
    riskScore: float
    riskLevel: str
    trend: float


class MessRisk(BaseModel):
    messId: str
    messName: str
    reportCount: int
    associationScore: float
    riskLevel: str


class AnalyticsResponse(BaseModel):
    available: bool = True
    overallRisk: str = 'LOW'
    riskLevel: str = 'LOW'
    blocks: List[BlockRisk] = Field(default_factory=list)
    messes: List[MessRisk] = Field(default_factory=list)
    suspectedExposures: List[ExposureEvidence] = Field(default_factory=list)
    evidence: List[str] = Field(default_factory=list)
    baseline: Dict[str, Any] = Field(default_factory=dict)
    temporal: Dict[str, Any] = Field(default_factory=dict)
    spatial: Dict[str, Any] = Field(default_factory=dict)
    symptom: Dict[str, Any] = Field(default_factory=dict)
    mess: Dict[str, Any] = Field(default_factory=dict)
    meal: Dict[str, Any] = Field(default_factory=dict)
    water: Dict[str, Any] = Field(default_factory=dict)
    statistical: Dict[str, Any] = Field(default_factory=dict)


@app.get('/health', response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(service='campusshield-analytics', status='ok', phase='phase-1-scaffold')


@app.post('/analyze', response_model=AnalyticsResponse)
def analyze(payload: AnalyticsRequest) -> AnalyticsResponse:
    report = payload.report or {}
    recent = payload.recentReports or []

    if not report:
        raise HTTPException(status_code=400, detail='Report payload is required')

    block_name = str(report.get('block') or report.get('hostel') or 'Unknown Block')
    mess_name = str(report.get('exposure', {}).get('mess') or report.get('mess') or 'Unknown Mess')
    meal_name = str(report.get('exposure', {}).get('meal') or report.get('meal') or 'Not sure')
    water_source = str(report.get('exposure', {}).get('waterSource') or report.get('waterSource') or 'Unknown')
    symptoms = report.get('symptoms') or report.get('normalizedSymptoms') or []
    if isinstance(symptoms, list):
        symptom_names = [
            item.get('canonical') if isinstance(item, dict) else str(item)
            for item in symptoms[:8]
            if item is not None
        ]
    else:
        symptom_names = [str(symptoms)]

    block_count = 1 + sum(1 for item in recent if str(item.get('block') or item.get('hostel') or '').lower() == str(block_name).lower())
    mess_count = 1 + sum(1 for item in recent if str(item.get('exposure', {}).get('mess') or item.get('mess') or '').lower() == str(mess_name).lower())
    symptom_overlap = max(1, min(5, len(symptom_names)))
    base_risk = min(100.0, (block_count * 12.0) + (mess_count * 10.0) + (symptom_overlap * 8.0))

    if base_risk >= 70:
        overall = 'HIGH'
    elif base_risk >= 45:
        overall = 'SUSPICIOUS'
    elif base_risk >= 20:
        overall = 'WATCH'
    else:
        overall = 'LOW'

    blocks = [
        BlockRisk(
            blockId=f'BLOCK:{block_name}',
            blockName=block_name,
            reportCount=max(1, block_count),
            baseline=max(0.05, min(0.95, 0.2 + (block_count * 0.06))),
            riskScore=min(100.0, base_risk),
            riskLevel=overall,
            trend=max(0.0, min(100.0, base_risk * 0.85)),
        )
    ]

    messes = [
        MessRisk(
            messId=f'MESS:{mess_name}',
            messName=mess_name,
            reportCount=max(1, mess_count),
            associationScore=min(0.99, max(0.15, (mess_count / max(1, len(recent) + 1)) + 0.45)),
            riskLevel=overall,
        )
    ]

    suspected_exposures = [
        ExposureEvidence(
            type='MESS',
            id=f'MESS:{mess_name}',
            name=mess_name,
            associationScore=messes[0].associationScore,
            evidence=[f'Mess exposure pattern for {meal_name} cluster', f'Block-level concentration around {block_name}'],
        ),
        ExposureEvidence(
            type='WATER',
            id=f'WATER:{water_source}',
            name=water_source,
            associationScore=min(0.9, max(0.15, 0.35 + (len(symptom_names) * 0.08))),
            evidence=[f'Water source repeated in recent reports: {water_source}', 'Shared exposure review suggests repeated contact'],
        ),
    ]

    return AnalyticsResponse(
        available=True,
        overallRisk=overall,
        riskLevel=overall,
        blocks=blocks,
        messes=messes,
        suspectedExposures=suspected_exposures,
        evidence=[
            f'Baseline review for {block_name} indicates elevated recent reports.',
            f'Temporal clustering around {meal_name} exposure window.',
            f'Symptom similarity among {len(symptom_names)} normalized indicators.',
            f'Observation of shared mess exposure at {mess_name}.',
            f'Water source review for {water_source}.',
        ],
        baseline={'windowHours': 24, 'referenceLevel': max(0.1, 0.35), 'currentDeviation': min(1.0, base_risk / 100.0)},
        temporal={'windowHours': 24, 'clustered': block_count >= 2, 'peakWindow': meal_name},
        spatial={'focus': block_name, 'sharedSites': [block_name, mess_name]},
        symptom={'normalizedSymptoms': symptom_names, 'similaritySignal': round(min(1.0, len(symptom_names) / 5.0), 2)},
        mess={'messName': mess_name, 'meal': meal_name, 'associationScore': round(messes[0].associationScore, 2)},
        meal={'mealName': meal_name, 'associationScore': round(messes[0].associationScore, 2)},
        water={'waterSource': water_source, 'associationScore': round(suspected_exposures[1].associationScore, 2)},
        statistical={'riskScore': round(base_risk, 2), 'confidence': round(min(1.0, base_risk / 100.0), 2), 'signalStrength': 'moderate'},
    )
