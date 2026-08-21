# CAMPUSSHIELD Analytics Service

FastAPI microservice reserved for explainable baseline, temporal, spatial, exposure, permutation, source-ranking, and counterfactual analytics.

## Local setup

```bash
cp .env.example .env
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Phase 1 includes a health endpoint only. Statistical methods are planned for Phase 6 onward.
