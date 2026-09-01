from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Multi-Agent Autonomous Financial Intelligence System"
    API_V1_STR: str = "/api/v1"
    DATABASE_URL: str = "sqlite:///./financial_intelligence.db"
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"
    
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8000",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:8000",
        "*"
    ]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )


settings = Settings()
