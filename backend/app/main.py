import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from app.config import settings
from app.db.session import init_db, SessionLocal
from app.db.seed import seed_database
from app.api.v1 import health, users, analyze, websocket
from app.api.routes.intelligence import router as intelligence_router

logging.basicConfig(level=getattr(logging, settings.LOG_LEVEL))
logger = logging.getLogger("main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing database schema...")
    init_db()
    
    logger.info("Seeding initial database state...")
    db = SessionLocal()
    try:
        seed_database(db)
    except Exception as e:
        logger.warning(f"Database seeding warning: {e}")
    finally:
        db.close()
        
    yield
    logger.info("Shutting down application...")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="Multi-Agent Autonomous Financial Intelligence System REST & WebSocket API",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", include_in_schema=False)
async def root():
    """Redirect root endpoint to interactive Swagger UI documentation."""
    return RedirectResponse(url="/docs")


# Root-level health & websocket routes
app.include_router(health.router)
app.include_router(websocket.router)

# Mount Engineer 1's Phase 1 intelligence route
app.include_router(intelligence_router)

# Mount API v1 endpoints
app.include_router(users.router, prefix="/api/v1")
app.include_router(analyze.router, prefix="/api/v1")
app.include_router(websocket.router, prefix="/api/v1")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
