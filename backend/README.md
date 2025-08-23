Aura Finance AI Backend (FastAPI)

Quick start:

1. Create and activate a virtualenv (optional)
2. Install deps: `pip install -r requirements.txt`
3. Run: `uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload`

Dev Notes:
- API base path is `/api`
- Health endpoint: `/health`
- CORS is open by default (adjust for production)