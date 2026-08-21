# CAMPUSSHIELD

**Detect the cluster. Find the source. Stop the spread.**

CAMPUSSHIELD is a hackathon-focused, explainable early-warning and source-attribution platform for detecting potential food-borne and water-borne illness outbreaks in Indian college hostels, PGs, and campuses.

> Decision-support disclaimer: CAMPUSSHIELD is not a medical diagnostic system and must not be used as a substitute for clinical or public-health authority judgment. The product language uses terms such as **leading suspected exposure**, **potential common source**, and **probable association** instead of claiming causality.

## Problem statement

Campus illness reports are often reviewed as isolated incidents. Outbreak detection requires connecting **when symptoms began**, **where students live**, **what they ate**, and **which shared resources they used** so administrators can identify unusual clusters early without exposing unnecessary personal health information.

## Solution

CAMPUSSHIELD combines a secure MERN application with a Python analytics microservice. Students submit fast, minimal symptom and exposure reports. Health administrators see aggregated outbreak radar, explainable evidence, source rankings, and simulation-driven demo workflows. Hostel administrators see privacy-preserving hostel/block-level operational views.

## Key differentiators

- Explainable outbreak confidence engine, not a black-box detector.
- Baseline, temporal, spatial, symptom, exposure, growth-rate, and statistical evidence fusion.
- Coincidence/permutation testing for common-source hypotheses.
- Counterfactual analysis: “What if this exposure was removed?”
- Source attribution labels associations, not confirmed contamination.
- Privacy-first aggregated maps and pseudonymous analytics identifiers.
- Synthetic campus simulation and outbreak replay for hackathon demos.

## Features

### Implemented in Phase 1

- Monorepo structure for frontend, backend, analytics, scripts, and docs.
- React + TypeScript + Vite frontend shell with Tailwind styling.
- Express + TypeScript backend health endpoints and Socket.IO scaffold.
- FastAPI analytics service health endpoint.
- Dockerfiles for backend and analytics.
- `docker-compose.yml` for MongoDB, Redis, backend, and analytics.
- Root and service-specific environment examples.
- Firebase credentials example with mock-notification fallback documented.
- Initial architecture, API, analytics, database, demo, and deployment docs.

### Planned

- Authentication, JWT, bcrypt, RBAC, and audit logging.
- Mongoose data models and indexes.
- Student symptom and health issue reporting.
- Outbreak Radar dashboard with Leaflet aggregated map.
- Explainable analytics pipelines and source attribution.
- Real-time updates, notifications, simulation engine, and replay.
- Test suites for backend, frontend, and analytics.

## Architecture

```text
Student / Admin Browser
        ↓
React + TypeScript + Vite frontend
        ↓ REST + Socket.IO
Node.js + Express + TypeScript backend
        ↓
MongoDB + Redis
        ↓ internal authenticated calls
FastAPI Python analytics service
```

The Express backend remains the primary public API and authorization boundary. The Python analytics service is internal and reserved for statistical/geospatial workloads.

## Tech stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, React Router, TanStack Query, Axios, React Hook Form, Zod, Recharts, Leaflet.
- **Backend:** Node.js, Express, TypeScript, MongoDB, Mongoose, JWT, bcrypt, Socket.IO, Redis, Helmet, CORS, rate limiting.
- **Analytics:** FastAPI, Pandas, NumPy, SciPy, scikit-learn, statsmodels, GeoPandas.
- **Notifications:** Firebase Cloud Messaging architecture with local mock mode when credentials are absent.
- **Deployment:** Docker, docker-compose, Vercel-ready frontend, independently deployable backend and analytics services.

## Folder structure

```text
.
├── README.md
├── docker-compose.yml
├── .env.example
├── firebase.example.json
├── frontend/
│   ├── package.json
│   ├── .env.example
│   ├── src/
│   └── README.md
├── backend/
│   ├── package.json
│   ├── .env.example
│   ├── src/
│   └── README.md
├── analytics/
│   ├── requirements.txt
│   ├── .env.example
│   ├── app/
│   └── README.md
├── scripts/
│   └── README.md
└── docs/
    ├── architecture.md
    ├── api.md
    ├── analytics.md
    ├── database.md
    ├── demo.md
    └── deployment.md
```

## Setup instructions

### Required local tools

- Node.js LTS, preferably Node 20+
- npm
- Git
- Docker Desktop
- Python 3.11 compatible runtime
- MongoDB if not using Docker
- Redis if not using Docker

### Install JavaScript dependencies

```bash
npm install
npm install --prefix frontend
npm install --prefix backend
```

Do not download `node_modules` manually. npm recreates dependencies from `package.json` and generated lock files.

### Frontend local files

Required files:
- `frontend/package.json`
- `frontend/package-lock.json` after `npm install --prefix frontend`
- `frontend/.env.local` copied from `frontend/.env.example`

Run:

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

### Backend local files

Required files:
- `backend/package.json`
- `backend/package-lock.json` after `npm install --prefix backend`
- `backend/.env` copied from `backend/.env.example`

Run:

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

### Analytics local files

Required files:
- `analytics/requirements.txt`
- `analytics/.env` copied from `analytics/.env.example`

Run:

```bash
cd analytics
cp .env.example .env
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Environment variables

Root `.env.example` provides Docker Compose defaults. Service-specific examples are authoritative for local service execution.

### Backend

- `MONGODB_URI`
- `JWT_SECRET`
- `REDIS_URL`
- `FRONTEND_URL`
- `PYTHON_ANALYTICS_URL`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `MAPBOX_TOKEN`
- `NOTIFICATION_MODE=mock`

### Frontend

- `VITE_API_URL`
- `VITE_SOCKET_URL`
- `VITE_MAPBOX_TOKEN` optional; default demo will use Leaflet/OpenStreetMap.
- `VITE_FIREBASE_CONFIG` optional until browser push is configured.

### Analytics

- `MONGODB_URI`
- `ANALYTICS_SECRET`
- `PORT`

## Database setup

Phase 1 uses MongoDB through Docker Compose or a local MongoDB instance. Mongoose schemas and indexes will be implemented in Phase 3.

## Running each service

```bash
npm run dev:frontend
npm run dev:backend
cd analytics && uvicorn app.main:app --reload
```

Health checks:

```bash
curl http://localhost:4000/health
curl http://localhost:4000/api/health
curl http://localhost:8000/health
```

## Docker instructions

Run infrastructure and services:

```bash
docker compose up --build
```

Services:
- MongoDB: `localhost:27017`
- Redis: `localhost:6379`
- Backend: `http://localhost:4000`
- Analytics: `http://localhost:8000`

The frontend is intentionally run locally with Vite in Phase 1:

```bash
npm run dev:frontend
```

## Map setup

CAMPUSSHIELD defaults to Leaflet/OpenStreetMap for local demos so a paid token is not required. If Mapbox is later enabled, create a Mapbox token and set `VITE_MAPBOX_TOKEN` and/or backend `MAPBOX_TOKEN` as documented in the service `.env.example` files.

## Firebase setup

Firebase credentials cannot be generated by this repository.

1. Create a Firebase project.
2. Enable Cloud Messaging.
3. Create a service account credential.
4. Use `firebase.example.json` as the shape reference.
5. Add credential values to backend `.env` or a secure secret manager.
6. Restart the backend.

If Firebase is not configured, `NOTIFICATION_MODE=mock` keeps notification flows local and clearly marked as mocked.

## Demo mode

Phase 1 includes only a visible **DEMO MODE** frontend shell. Planned demo controls:

- Generate normal campus data.
- Simulate foodborne outbreak.
- Simulate waterborne outbreak.
- Simulate false alarm.
- Watch outbreak confidence change.
- View source attribution.
- Trigger targeted notifications.
- Replay outbreak timeline.

## Synthetic data generation

Planned synthetic data will include students, hostels, blocks, messes, meals, menus, water sources, and historical illness data. All identities will be obviously synthetic. Phase 1 only creates the scripts folder and documentation placeholder.

## API overview

Implemented in Phase 1:

- `GET /health` — backend service health.
- `GET /api/health` — backend API health.
- `GET /health` on analytics service — analytics health.

Planned APIs include authentication, symptom reports, outbreak lifecycle, analytics, hostels, messes, meals, water sources, simulations, and advisories.

## Analytics methodology

CAMPUSSHIELD will use configurable prototype thresholds and explainable methods:

- Rolling averages, EWMA, CUSUM, Poisson/Negative Binomial modeling where appropriate.
- Temporal onset concentration and growth-rate detection.
- Spatial clustering with DBSCAN/Haversine-style distance and rate adjustment by population.
- Exposure association using attack rates, relative risk, odds ratios, Fisher’s exact test, and chi-square where appropriate.
- Permutation testing to estimate whether observed exposure concentration could occur by chance.
- Evidence fusion with configurable weights and clearly labeled prototype thresholds.
- Counterfactual re-scoring using the same evidence pipeline.

No analytics are medically validated in Phase 1.

## Security and privacy

Planned controls:

- JWT authentication and password hashing.
- Role-based access control for STUDENT, HEALTH_ADMIN, HOSTEL_ADMIN, and SUPER_ADMIN.
- Helmet, CORS configuration, input validation, rate limiting, and centralized errors.
- Audit logging and secure environment variables.
- Data minimization, pseudonymous analytics IDs, and aggregated maps.
- No unnecessary PII in analytics views.

Phase 1 has Helmet, CORS, JSON limits, rate limiting, and environment scaffolding only.

## Limitations

- Phase 1 is scaffolding, not a complete application.
- Authentication, RBAC, database models, reports, outbreak analytics, maps, notifications, and simulations are not implemented yet.
- Docker Compose has service wiring but has not been validated against full domain workflows.
- Analytics health endpoint exists, but statistical endpoints are planned.

## Future improvements

- Add full test coverage and CI.
- Add robust background job processing.
- Add offline-capable PWA report queue.
- Add administrative threshold tuning UI.
- Add richer geospatial visualizations and exportable investigation reports.

## Current implementation status

| Phase | Status | Notes |
| --- | --- | --- |
| Phase 1: Project scaffolding, README, Docker, environment configuration | DONE | Monorepo, service shells, Docker Compose, env examples, and docs are implemented. |
| Phase 2: Authentication and RBAC | TODO | JWT, bcrypt, roles, auth UI, and permissions pending. |
| Phase 3: Database models and seed data | TODO | Mongoose models, indexes, and synthetic seed data pending. |
| Phase 4: Student symptom reporting | TODO | Student PWA report flow pending. |
| Phase 5: Admin dashboard | TODO | Outbreak Radar, KPIs, maps, and charts pending. |
| Phase 6: Outbreak analytics service | TODO | Explainable analytics endpoints pending. |
| Phase 7: Exposure/source attribution | TODO | Association tests and source rankings pending. |
| Phase 8: Real-time updates | IN PROGRESS | Socket.IO server scaffold exists; domain events pending. |
| Phase 9: Notifications | TODO | Firebase/mock notification architecture pending. |
| Phase 10: Simulation engine | TODO | Demo data and outbreak scenario controls pending. |
| Phase 11: Explainability, counterfactual analysis, outbreak replay | TODO | Planned after analytics and simulation. |
| Phase 12: Testing, security, performance, documentation, final polish | TODO | Test scripts exist as placeholders; tests pending. |

## Known issues

- No domain UI routes beyond the Phase 1 landing shell.
- No package lock files until dependency installation is run.
- Backend currently does not connect to MongoDB or Redis; this is intentional for Phase 1 health scaffolding.
- The `scripts/seed.js` and `scripts/generateSyntheticData.js` executables are planned, not implemented.
