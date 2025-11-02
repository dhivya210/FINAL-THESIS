"""Database engine, session, and base class configuration."""

from __future__ import annotations

from contextlib import contextmanager
from typing import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, scoped_session, sessionmaker

from .config import get_settings


settings = get_settings()


class Base(DeclarativeBase):
    """Base class for SQLAlchemy models."""


engine = create_engine(
    settings.database_url,
    connect_args={"check_same_thread": False} if settings.database_url.startswith("sqlite") else {},
)

SessionLocal = scoped_session(sessionmaker(bind=engine, autocommit=False, autoflush=False))


@contextmanager
def session_scope() -> Generator:
    """Provide a transactional scope around operations."""

    session = SessionLocal()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def get_db() -> Generator:
    """FastAPI dependency that yields a database session."""

    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
