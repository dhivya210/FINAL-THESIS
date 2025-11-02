"""Application settings and configuration helpers."""

from functools import lru_cache
from pathlib import Path
from typing import List

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Centralised application configuration using environment variables."""

    app_name: str = "QA Automation Decision Support API"
    environment: str = "development"
    secret_key: str = "development-secret-key"
    allowed_origins: List[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]
    database_url: str = "sqlite:///" + str(Path(__file__).resolve().parent.parent.parent / "data" / "app.db")
    alembic_ini_path: Path = Path(__file__).resolve().parent.parent.parent / "alembic.ini"
    default_admin_email: str = "qa.lead@example.com"
    default_admin_password: str = "qa-team"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    """Return cached settings instance."""

    return Settings()
