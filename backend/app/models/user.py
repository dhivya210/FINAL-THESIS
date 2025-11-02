"""Simple user model for authentication stub."""

from __future__ import annotations

from datetime import datetime
from typing import List

from sqlalchemy import Column, DateTime, Integer, String
from sqlalchemy.orm import relationship

from app.core.database import Base


class User(Base):
    """Represents an application user (stubbed for demo)."""

    __tablename__ = "users"

    id: int = Column(Integer, primary_key=True, index=True)
    email: str = Column(String(120), unique=True, nullable=False)
    full_name: str = Column(String(120), nullable=False)
    role: str = Column(String(50), nullable=False, default="qa_lead")
    hashed_password: str = Column(String(200), nullable=False)
    created_at: datetime = Column(DateTime, nullable=False, default=datetime.utcnow)

    evaluations: List["Evaluation"] = relationship("Evaluation", back_populates="owner")

