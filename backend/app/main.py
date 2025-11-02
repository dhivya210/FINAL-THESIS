"""FastAPI application entry point."""

from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import auth, evaluations, tools
from app.core.config import get_settings
from app.seeds.bootstrap import ensure_seed_data


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title=settings.app_name)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(auth.router, prefix="/api/v1")
    app.include_router(tools.router, prefix="/api/v1")
    app.include_router(evaluations.router, prefix="/api/v1")

    @app.on_event("startup")
    def startup_event() -> None:  # pragma: no cover - executed at runtime
        ensure_seed_data()

    @app.get("/health")
    def healthcheck() -> dict[str, str]:
        return {"status": "ok"}

    return app


app = create_app()
