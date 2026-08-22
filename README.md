# CAMPUSSHIELD

**Detect the cluster. Find the source. Stop the spread.**

CAMPUSSHIELD is a hackathon-focused, explainable early-warning and source-attribution platform for detecting potential food-borne and water-borne illness outbreaks in Indian college hostels, PGs, and campuses.

> Decision-support disclaimer: CAMPUSSHIELD is not a medical diagnostic system and must not be used as a substitute for clinical or public-health authority judgment. The product language uses terms such as **leading suspected exposure**, **potential common source**, and **probable association** instead of claiming causality.

## Problem statement

Campus illness reports are often reviewed as isolated incidents. Outbreak detection requires connecting **when symptoms began**, **where students live**, **what they ate**, and **which shared resources they used** so administrators can identify unusual clusters early without exposing unnecessary personal health information.

## Solution

CAMPUSSHIELD combines a secure MERN application with a Python analytics microservice. Students submit fast, minimal symptom and exposure reports. Health administrators see a block-grid heatmap, explainable evidence, and source rankings generated from real report activity. Hostel administrators see privacy-preserving mess and block-level operational views.

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
- Block Grid Heatmap for hostel and mess risk intensity.
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

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, React Router, TanStack Query, Axios, React Hook Form, Zod, Recharts.
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

## CampusShield scope for this version

- Four roles only: Student, Health Admin, Mess/Facility Manager, and System Admin.
- No Public Health role or public-health dashboard is included in this implementation.
- Health Admin dashboards use a block-grid heatmap instead of a geographic map.
- Student report forms include hostel, block, mess, meal, water, and shared-exposure details for downstream analysis.
- Mess/Facility Manager alerts are focused on suspected shared-meal exposures rather than confirmed causation.
- All analytics language uses suspect/exposure/evidence terminology rather than definite medical conclusions.

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
- `GEMINI_API_KEY` server-side only; used for symptom normalization with Gemini
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `MAPBOX_TOKEN`
- `NOTIFICATION_MODE=mock`

## Gemini symptom normalization

CampusShield uses Gemini as the primary symptom normalization mechanism. The backend service `normalizeSymptomsText()` takes raw free-text student descriptions, asks Gemini to normalize them into the canonical symptom categories used by the app, and returns structured JSON.

Gemini is used only for symptom extraction and canonicalization. It does not diagnose disease, determine outbreak presence, identify contamination, or assert causation. The normalization result is only a confidence-scored mapping into predefined symptom categories.

### Required server-side setup

Add your Gemini API key to the backend environment as a server-only variable:

```bash
# backend/.env
GEMINI_API_KEY=your_api_key_here
```

This value stays in the backend environment and is never exposed via `VITE_*` frontend variables.

### Fallback behavior

If `GEMINI_API_KEY` is missing, the request times out, the API fails, or the response is invalid JSON, the system automatically falls back to the existing rule-based symptom mapping and returns:

- `status: "FALLBACK"`
- `source: "RULE_BASED"`

The rule-based fallback uses the same canonical categories:

- nausea
- vomiting
- diarrhea
- fever
- abdominal pain
- headache
- weakness
- stomach upset
- dehydration
- body ache
- dizziness
- loss of appetite

If a symptom is not recognized, it is preserved as `other` instead of inventing a diagnosis or outbreak conclusion.

### Example input/output

```text
Input:
"I've been throwing up since last night and having loose motions. My stomach is also hurting."

Output:
{
  "symptoms": [
    { "canonical": "vomiting", "confidence": 0.95 },
    { "canonical": "diarrhea", "confidence": 0.94 },
    { "canonical": "abdominal pain", "confidence": 0.91 }
  ],
  "syndrome": "gastrointestinal"
}
```

The confidence value represents how confident the system is in the normalization step, not the likelihood of disease or an outbreak.

### Normalization examples

```text
"throwing up and loose motions"
"stomach cramps and nausea"
"fever and weakness"
"I've been feeling sick and my stomach hurts"
```

These are converted into canonical categories where possible, and unknown or partially matched symptoms are retained as `other` instead of being treated as a diagnosis.

### Frontend

- `VITE_API_URL`
- `VITE_SOCKET_URL`
- `VITE_MAPBOX_TOKEN` optional; default demo will use Leaflet/OpenStreetMap.
- `VITE_FIREBASE_CONFIG` optional until browser push is configured.

### Analytics

- `MONGODB_URI`
- `ANALYTICS_SECRET`
- `PORT`

## Frontend styling restoration note

The frontend previously rendered like plain HTML because the project declared `tailwindcss: latest`, which can resolve to Tailwind CSS v4, while `frontend/postcss.config.js` still used the older Tailwind PostCSS plugin shape (`tailwindcss: {}`). In Tailwind v4, PostCSS integration moved to `@tailwindcss/postcss`; without that plugin installed and configured, the `@tailwind base/components/utilities` directives in `frontend/src/styles.css` were not transformed into CSS.

For this frontend-only fix, Tailwind processing was bypassed and replaced with a stable CSS design-system layer under `frontend/src/styles/`. This keeps the React entrypoint and app behavior intact while making the UI render correctly even when Tailwind v4/PostCSS configuration is unavailable.

Changed frontend styling files:

- `frontend/src/styles.css` now imports design-system CSS files instead of Tailwind directives.
- `frontend/src/styles/variables.css` defines CampusShield colors, radius, shadows, typography, and focus tokens.
- `frontend/src/styles/globals.css` defines global layout, typography, backgrounds, and accessibility focus behavior.
- `frontend/src/styles/components.css` defines reusable UI classes for navigation, badges, buttons, cards, KPI cards, map containers, risk indicators, and evidence panels.
- `frontend/src/styles/responsive.css` defines tablet/mobile behavior.
- `frontend/postcss.config.js` no longer invokes a broken Tailwind PostCSS plugin.

Tailwind v4 status: **replaced for active styling in this Phase 1 frontend shell**. Tailwind dependencies remain declared for future migration, but the working UI no longer depends on Tailwind compilation.

Run the frontend:

```bash
cd frontend
npm install
npm run dev
```

No new frontend dependency is required for the CSS design-system fallback.

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

This version intentionally does not rely on a geographic map as the primary outbreak radar. The health admin view uses a block-grid heatmap with real report activity, mess exposure scoring, and source-ranking explainability instead of map-based surveillance.

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

| Phase                                                                   | Status      | Notes                                                                                   |
| ----------------------------------------------------------------------- | ----------- | --------------------------------------------------------------------------------------- |
| Phase 1: Project scaffolding, README, Docker, environment configuration | DONE        | Monorepo, service shells, Docker Compose, env examples, and docs are implemented.       |
| Phase 2: Authentication and RBAC                                        | TODO        | JWT, bcrypt, roles, auth UI, and permissions pending.                                   |
| Phase 3: Database models and seed data                                  | TODO        | Mongoose models, indexes, and synthetic seed data pending.                              |
| Phase 4: Student symptom reporting                                      | TODO        | Student PWA report flow pending.                                                        |
| Phase 5: Admin dashboard                                                | Completed   | Block Grid Heatmap, block risk scoring, mess exposure analysis, and explainable alerts. |
| Phase 6: Outbreak analytics service                                     | TODO        | Explainable analytics endpoints pending.                                                |
| Phase 7: Exposure/source attribution                                    | TODO        | Association tests and source rankings pending.                                          |
| Phase 8: Real-time updates                                              | IN PROGRESS | Socket.IO server scaffold exists; domain events pending.                                |
| Phase 9: Notifications                                                  | TODO        | Firebase/mock notification architecture pending.                                        |
| Phase 10: Simulation engine                                             | TODO        | Demo data and outbreak scenario controls pending.                                       |
| Phase 11: Explainability, counterfactual analysis, outbreak replay      | TODO        | Planned after analytics and simulation.                                                 |
| Phase 12: Testing, security, performance, documentation, final polish   | TODO        | Test scripts exist as placeholders; tests pending.                                      |

## Known issues

- No domain UI routes beyond the Phase 1 landing shell.
- No package lock files until dependency installation is run.
- Backend currently does not connect to MongoDB or Redis; this is intentional for Phase 1 health scaffolding.
- The `scripts/seed.js` and `scripts/generateSyntheticData.js` executables are planned, not implemented.
