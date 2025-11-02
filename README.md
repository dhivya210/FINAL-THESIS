# QA Automation Decision-Support App

Full-stack prototype that guides QA teams through selecting the most suitable test automation tooling. The experience blends a polished React/Tailwind front-end with a FastAPI backend, seeded benchmarking data, live scoring, and executive-ready reporting.

## Highlights

- **Guided 12-question questionnaire** with smart hints, persistence, and progress tracking.
- **Weighted scoring engine** backed by seeded metadata for Testim, Mabl, Playwright, Selenium, Cypress, and more.
- **Interactive results dashboard** featuring live what-if sliders, radar & bar charts powered by Recharts.
- **Tool comparison workspace** with PDF export (jsPDF + html2canvas) and CRUD controls to maintain the catalogue.
- **Executive report view** delivering downloadable PDF/JSON exports and curated insights for stakeholders.
- **Simple auth stub** (demo credentials) and light/dark mode micro-interactions via Framer Motion.
- **Deploy-ready** Dockerfiles plus `docker-compose` provisioning FastAPI, PostgreSQL, and the static React bundle.

## Project Structure

```
./backend     # FastAPI application, models, services, seeds, Alembic migrations
./frontend    # React + Vite + Tailwind UI, routes, charts, PDF integration
docker-compose.yml
```

### Backend Stack
- FastAPI + SQLAlchemy (sync) with Alembic migrations
- SQLite (default) / PostgreSQL-ready; automatic seeding on startup
- Auth stub issuing a bearer token for the seeded QA lead account
- Evaluation engine encapsulated in `app/services/evaluation_service.py`

### Frontend Stack
- Vite + React 18 + TypeScript
- TailwindCSS with Framer Motion transitions and dark mode support
- Recharts for radar/bar/area visualizations
- jsPDF + html2canvas for PDF exports

## Getting Started (Local Dev)

### 1. Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Apply migrations and run
alembic upgrade head
uvicorn app.main:app --reload
```

Backend runs on `http://localhost:8000`. Swagger docs: `http://localhost:8000/docs`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Vite serves on `http://localhost:5173` with proxying to the FastAPI backend.

### Demo Credentials

```
Email:    qa.lead@example.com
Password: qa-team
```

Use the **Sign in** button in the top navigation to authenticate before entering the questionnaire.

## Dockerised Workflow

Requirements: Docker + Docker Compose.

```bash
docker-compose up --build
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000 (proxied through Nginx for `/api/*` requests)
- PostgreSQL: internal service `db` with credentials defined in `docker-compose.yml`

Data persists in the named Docker volume `db-data`. The backend container automatically applies Alembic migrations on startup.

## Key API Endpoints

- `POST /api/v1/auth/login` ? authenticate (demo credentials)
- `GET /api/v1/tools/` ? list catalogued tools (CRUD endpoints available)
- `POST /api/v1/evaluations/run` ? execute scoring engine and persist results
- `GET /api/v1/evaluations/{id}` ? retrieve stored evaluation with chart data
- `GET /api/v1/evaluations/{id}/export/json` ? download evaluation snapshot

## Functional Notes

- 12 questionnaire inputs map directly to the evaluation schema; sliders emit 0?100 values for AI/reporting priorities.
- Client-side weight sliders reuse server criteria values to provide instant recalculation without additional API calls.
- Tool comparison page offers admin editing to adjust seeded metadata; changes persist to the database via CRUD endpoints.
- PDF exports rely on client-side rendering; ensure the displayed section is fully visible on screen before exporting for best fidelity.

## Testing & Quality

- Unit tests are not included in this prototype, but the architecture supports FastAPI TestClient and React Testing Library.
- TypeScript guards many UI interactions, and Tailwind utility classes favour accessible defaults (`@tailwindcss/forms` plugin).

## Roadmap Ideas

- Promote the auth stub to a proper OAuth/session-backed workflow.
- Introduce scenario management (multiple evaluations per user) and richer analytics history.
- Add automated test coverage plus CI/CD integration scripts.
- Extend PDF output with branded cover pages and appendix sections.

---

Built for QA leads seeking a confident, data-backed path to automation tooling decisions.
