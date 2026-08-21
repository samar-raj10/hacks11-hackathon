from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="CAMPUSSHIELD Analytics", version="0.1.0")

class HealthResponse(BaseModel):
    service: str
    status: str
    phase: str

@app.get('/health', response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(service='campusshield-analytics', status='ok', phase='phase-1-scaffold')
