"""Authentication schemas."""

from __future__ import annotations

from pydantic import BaseModel, EmailStr, Field


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=4)


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_display_name: str
    role: str
