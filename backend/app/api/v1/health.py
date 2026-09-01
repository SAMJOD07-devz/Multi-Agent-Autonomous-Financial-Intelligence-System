from fastapi import APIRouter
from app.config import settings

router = APIRouter()


@router.get("/health", tags=["Health"])
async def root_health():
    return {"status": "healthy"}


@router.get("/api/v1/health", tags=["Health"])
async def v1_health():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": "1.0.0",
        "environment": settings.ENVIRONMENT
    }
