from fastapi import FastAPI
from app.api.routes.intelligence import router as intelligence_router

app = FastAPI(title="Multi-Agent Financial Intelligence API", version="1.0.0")
app.include_router(intelligence_router)

@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "healthy"}
