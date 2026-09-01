from fastapi import APIRouter
from app.api.v1 import health, users, analyze, websocket
from app.api.routes import intelligence

api_router = APIRouter()

# Mount health routes
api_router.include_router(health.router)

# Mount API v1 routes
api_router.include_router(health.router, prefix="/v1")
api_router.include_router(users.router, prefix="/v1")
api_router.include_router(analyze.router, prefix="/v1")
api_router.include_router(websocket.router, prefix="/v1")

# Mount Phase 1 intelligence route for backward compatibility
api_router.include_router(intelligence.router)
