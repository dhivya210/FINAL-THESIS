"""Authentication endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api import deps
from app.core.config import get_settings
from app.models import User
from app.schemas.auth import LoginRequest, LoginResponse
from app.utils.security import verify_password


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest, session: Session = Depends(deps.get_db_session)) -> LoginResponse:
    """Authenticate against the seeded demo user."""

    user = session.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    settings = get_settings()
    return LoginResponse(
        access_token=settings.secret_key,
        user_display_name=user.full_name,
        role=user.role,
    )


@router.get("/me", response_model=LoginResponse)
def read_current_user(current_user: User = Depends(deps.get_current_user)) -> LoginResponse:
    """Return the current stubbed user profile."""

    settings = get_settings()
    return LoginResponse(
        access_token=settings.secret_key,
        user_display_name=current_user.full_name,
        role=current_user.role,
    )
