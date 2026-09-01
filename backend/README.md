# Multi-Agent Financial Intelligence — Phase 1

A FastAPI MVP that runs independent fundamental, risk, and sentiment analyzers concurrently against a typed `FinancialContext`. The implementation uses deterministic demo rules, mock data-provider boundaries, structured evidence, and graceful degradation for missing or invalid agent inputs.

## Run locally

```bash
cd backend
python -m venv .venv && . .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The API is available at `POST /api/intelligence/analyze`; health is available at `GET /health`. Run tests with `pytest -q`.
