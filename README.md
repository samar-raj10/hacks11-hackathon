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

- The application is partially functional but not yet complete against the final acceptance criteria.
- Authentication, backend RBAC, student reports, advisories, notifications, audit logs, and a lightweight analytics handoff are implemented.
- Advanced outbreak radar maps, simulations, facility corrective actions, Redis-backed workflows, and full statistical source-attribution are still planned.
- Docker Compose has service wiring but has not been validated in this environment.

## Future improvements

- Add full test coverage and CI.
- Add robust background job processing.
- Add offline-capable PWA report queue.
- Add administrative threshold tuning UI.
- Add richer geospatial visualizations and exportable investigation reports.


## Full-stack implementation update

This increment adds the first functional backend-enforced workflows beyond the Phase 1 shell.

### Implemented now

- **Authentication:** `POST /api/auth/register`, `POST /api/auth/login`, and `GET /api/auth/me` use MongoDB user records, bcrypt password hashing, JWTs, and public registration constrained to the `STUDENT` role.
- **Backend RBAC:** Protected routes use JWT authentication and server-side role checks. Students cannot access health-admin/system-admin routes by changing frontend URLs.
- **Student reports:** Authenticated students can submit symptom/exposure reports through `POST /api/reports`; reports are stored in MongoDB and appear in `GET /api/reports/my`.
- **Analytics handoff:** Report submission calls the Python analytics service `POST /analyze` with `ANALYTICS_SECRET`; the returned explainable risk summary is stored on the report. If analytics is unavailable, the report still stores with a pending analytics summary.
- **Dashboards:** Role-specific dashboard endpoints read MongoDB state for student, health-admin, facility, system-admin, and public-health views.
- **Advisories and in-app notifications:** Health Admin/System Admin can create advisories; matching users receive `Notification` records in mock/in-app mode without Firebase.
- **Audit logs:** Registration, login, report creation, user creation, and advisory creation write `AuditLog` records.
- **Frontend:** The landing page now has LOGIN and REGISTER actions, role-aware redirects, protected dashboard screens, a real student symptom report form, report history, advisories, and role dashboards that call backend APIs.

### New API routes

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/reports`
- `GET /api/reports/my`
- `GET /api/reports`
- `GET /api/reports/public-health`
- `GET /api/dashboard/student`
- `GET /api/dashboard/health-admin`
- `GET /api/dashboard/facility`
- `GET /api/dashboard/system-admin`
- `GET /api/dashboard/public-health`
- `GET /api/advisories`
- `POST /api/advisories`
- `GET /api/notifications`
- `POST /api/notifications/:id/read`
- `GET /api/admin/users`
- `POST /api/admin/users`
- `GET /api/admin/audit-logs`

### Roles implemented

- `STUDENT`
- `HEALTH_ADMIN`
- `FACILITY_MANAGER`
- `SYSTEM_ADMIN`
- `PUBLIC_HEALTH_VIEWER`

### Configuration added

Backend now requires `ANALYTICS_SECRET` when calling analytics endpoints. The analytics service validates `x-analytics-secret` when `ANALYTICS_SECRET` is configured.

### Current limitations

- Facility corrective-action storage, full infrastructure management, simulations, Redis-backed queues, and Socket.IO dashboard refresh are still planned.
- Outbreak analytics are explainable and data-derived but intentionally lightweight in this increment; advanced baseline/EWMA/DBSCAN/permutation/source-attribution endpoints remain planned.
- Frontend uses browser `fetch` and the existing CSS design system; advanced charts and Leaflet maps are still planned.

## Current implementation status

| Phase | Status | Notes |
| --- | --- | --- |
| Phase 1: Project scaffolding, README, Docker, environment configuration | DONE | Monorepo, service shells, Docker Compose, env examples, and docs are implemented. |
| Phase 2: Authentication and RBAC | DONE | JWT, bcrypt, MongoDB users, backend RBAC middleware, public student registration, and role dashboards implemented. |
| Phase 3: Database models and seed data | IN PROGRESS | Core User, HealthReport, Advisory, Notification, and AuditLog models exist; infrastructure/seed models remain planned. |
| Phase 4: Student symptom reporting | IN PROGRESS | Authenticated student report submission, MongoDB storage, history, and analytics handoff implemented. |
| Phase 5: Admin dashboard | TODO | Outbreak Radar, KPIs, maps, and charts pending. |
| Phase 6: Outbreak analytics service | IN PROGRESS | `/analyze` endpoint returns data-derived risk/evidence summary; advanced statistical modules remain planned. |
| Phase 7: Exposure/source attribution | TODO | Association tests and source rankings pending. |
| Phase 8: Real-time updates | IN PROGRESS | Socket.IO server scaffold exists; domain events pending. |
| Phase 9: Notifications | IN PROGRESS | In-app mock notification records are created for reports/advisories; Firebase push remains optional/planned. |
| Phase 10: Simulation engine | TODO | Demo data and outbreak scenario controls pending. |
| Phase 11: Explainability, counterfactual analysis, outbreak replay | TODO | Planned after analytics and simulation. |
| Phase 12: Testing, security, performance, documentation, final polish | TODO | Test scripts exist as placeholders; tests pending. |

## Known issues

- Frontend package installation is still environment-dependent because npm registry access was blocked in this workspace.
- Backend now requires MongoDB at startup and will fail fast if `MONGODB_URI` is unavailable.
- Redis is configured but not yet used for queues/caching.
- The `scripts/seed.js` and `scripts/generateSyntheticData.js` executables are planned, not implemented.
- Advanced epidemiological validation is not claimed; current analytics are a lightweight explainable prototype.
