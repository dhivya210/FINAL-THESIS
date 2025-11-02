"""Evaluation persistence model."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any, Dict, Optional

from sqlalchemy import JSON, Column, DateTime, ForeignKey, String, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


class Evaluation(Base):
    """Stores questionnaire responses and scoring outcomes."""

    __tablename__ = "evaluations"

    id: str = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title: str = Column(String(150), nullable=False, default="Untitled Evaluation")
    summary: Optional[str] = Column(Text)
    answers: Dict[str, Any] = Column(JSON, nullable=False, default=dict)
    weight_profile: Dict[str, Any] = Column(JSON, nullable=False, default=dict)
    results_snapshot: Dict[str, Any] = Column(JSON, nullable=False, default=dict)
    created_at: datetime = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at: datetime = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    status: str = Column(String(30), nullable=False, default="draft")
    owner_id: Optional[int] = Column(ForeignKey("users.id"), nullable=True)

    owner = relationship("User", back_populates="evaluations")

