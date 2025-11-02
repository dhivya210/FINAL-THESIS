"""Reusable dependencies for FastAPI routes."""

from __future__ import annotations

from typing import Generator

from fastapi import Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.config import get_settings
from app.models import User


def get_db_session() -> Generator[Session, None, None]:
    yield from get_db()


def get_current_user(
    request: Request,
    session: Session = Depends(get_db),
) -> User:
    """Retrieve the demo user from the provided bearer token."""

    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.lower().startswith("bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing credentials")

    token = auth_header.split(" ", maxsplit=1)[1].strip()
    settings = get_settings()

    if token != settings.secret_key:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    user = session.query(User).filter(User.email == settings.default_admin_email).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User not initialised")

    return user
